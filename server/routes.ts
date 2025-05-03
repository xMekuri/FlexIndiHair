import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  requireAdmin,
  requireCustomer,
  optionalCustomer,
  generateAdminToken,
  generateCustomerToken,
} from "./middleware/auth";
import * as schema from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create a unique filename
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueName + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.") as any);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API prefix
  const apiPrefix = "/api";

  // Error handling middleware
  const handleErrors = (fn: any) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Admin Authentication Routes
  app.post(
    `${apiPrefix}/admin/login`,
    handleErrors(async (req, res) => {
      const { email, password } = schema.loginSchema.parse(req.body);

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateAdminToken({ id: admin.id, email: admin.email });
      res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
    })
  );

  // Customer Authentication Routes
  app.post(
    `${apiPrefix}/customer/register`,
    handleErrors(async (req, res) => {
      const customerData = schema.customerInsertSchema.parse(req.body);

      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const customer = await storage.createCustomer(customerData);
      const token = generateCustomerToken({ id: customer.id, email: customer.email });

      // Don't return the password
      const { password, ...customerWithoutPassword } = customer;
      res.status(201).json({ token, customer: customerWithoutPassword });
    })
  );

  app.post(
    `${apiPrefix}/customer/login`,
    handleErrors(async (req, res) => {
      const { email, password } = schema.loginSchema.parse(req.body);

      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateCustomerToken({ id: customer.id, email: customer.email });

      // Don't return the password
      const { password: _, ...customerWithoutPassword } = customer;
      res.json({ token, customer: customerWithoutPassword });
    })
  );

  // Category Routes
  app.get(
    `${apiPrefix}/categories`,
    handleErrors(async (req, res) => {
      const active = req.query.active === "true";
      const categories = await storage.getAllCategories({ active });
      res.json(categories);
    })
  );

  app.get(
    `${apiPrefix}/categories/:id`,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    })
  );

  app.post(
    `${apiPrefix}/categories`,
    requireAdmin,
    upload.single("image"),
    handleErrors(async (req, res) => {
      const categoryData = schema.categoryInsertSchema.parse(req.body);

      // Add image if uploaded
      if (req.file) {
        categoryData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    })
  );

  app.put(
    `${apiPrefix}/categories/:id`,
    requireAdmin,
    upload.single("image"),
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const categoryData = req.body;

      // Add image if uploaded
      if (req.file) {
        categoryData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    })
  );

  app.delete(
    `${apiPrefix}/categories/:id`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    })
  );

  // Product Routes
  app.get(
    `${apiPrefix}/products`,
    handleErrors(async (req, res) => {
      const {
        active,
        categoryId,
        featured,
        search,
        page = "1",
        limit = "12",
        sort,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getAllProducts({
        active: active === "true",
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        featured: featured === "true",
        search: search as string,
        limit: limitNum,
        offset,
        sort: sort as string,
      });

      res.json({
        products: result.products,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    })
  );

  app.get(
    `${apiPrefix}/products/:id`,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    })
  );

  app.get(
    `${apiPrefix}/products/slug/:slug`,
    handleErrors(async (req, res) => {
      const slug = req.params.slug;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    })
  );

  app.post(
    `${apiPrefix}/products`,
    requireAdmin,
    upload.single("mainImage"),
    handleErrors(async (req, res) => {
      const productData = schema.productInsertSchema.parse({
        ...req.body,
        price: parseFloat(req.body.price),
        compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : null,
        stock: parseInt(req.body.stock),
        categoryId: parseInt(req.body.categoryId),
        isActive: req.body.isActive === "true",
        isFeatured: req.body.isFeatured === "true",
        isNew: req.body.isNew === "true",
        isOnSale: req.body.isOnSale === "true",
      });

      // Add main image if uploaded
      if (req.file) {
        productData.mainImageUrl = `/uploads/${req.file.filename}`;
      }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    })
  );

  app.put(
    `${apiPrefix}/products/:id`,
    requireAdmin,
    upload.single("mainImage"),
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      let productData: any = { ...req.body };

      // Parse numeric values
      if (productData.price) productData.price = parseFloat(productData.price);
      if (productData.compareAtPrice) productData.compareAtPrice = parseFloat(productData.compareAtPrice);
      if (productData.stockQuantity) productData.stockQuantity = parseInt(productData.stockQuantity);
      if (productData.stock) productData.stockQuantity = parseInt(productData.stock); // backward compatibility
      if (productData.categoryId) productData.categoryId = parseInt(productData.categoryId);

      // Parse boolean values
      if (productData.isActive !== undefined) productData.isActive = productData.isActive === "true";
      if (productData.isFeatured !== undefined) productData.isFeatured = productData.isFeatured === "true";
      if (productData.isNew !== undefined) productData.isNew = productData.isNew === "true";
      if (productData.isOnSale !== undefined) productData.isOnSale = productData.isOnSale === "true";

      // Add main image if uploaded
      if (req.file) {
        productData.mainImageUrl = `/uploads/${req.file.filename}`;
      }

      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    })
  );

  app.delete(
    `${apiPrefix}/products/:id`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    })
  );

  // Product Images
  app.post(
    `${apiPrefix}/products/:id/images`,
    requireAdmin,
    upload.single("image"),
    handleErrors(async (req, res) => {
      const productId = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imageData = {
        productId,
        imageUrl: `/uploads/${req.file.filename}`,
        sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : 0,
      };

      const image = await storage.addProductImage(imageData);
      res.status(201).json(image);
    })
  );

  app.delete(
    `${apiPrefix}/product-images/:id`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      await storage.deleteProductImage(id);
      res.json({ message: "Product image deleted successfully" });
    })
  );

  // Product Reviews
  app.get(
    `${apiPrefix}/products/:id/reviews`,
    handleErrors(async (req, res) => {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    })
  );

  app.post(
    `${apiPrefix}/products/:id/reviews`,
    requireCustomer,
    handleErrors(async (req, res) => {
      const productId = parseInt(req.params.id);
      const customerId = req.customer!.id;

      const reviewData = schema.productReviewInsertSchema.parse({
        ...req.body,
        productId,
        customerId,
        rating: parseInt(req.body.rating),
      });

      const review = await storage.addProductReview(reviewData);
      res.status(201).json(review);
    })
  );

  // Customer Routes
  app.get(
    `${apiPrefix}/customers`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const { search, page = "1", limit = "10" } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getAllCustomers({
        search: search as string,
        limit: limitNum,
        offset,
      });

      res.json({
        customers: result.customers,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    })
  );

  app.get(
    `${apiPrefix}/customers/:id`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Don't return the password
      const { password, ...customerWithoutPassword } = customer;
      res.json(customerWithoutPassword);
    })
  );

  app.get(
    `${apiPrefix}/customer/profile`,
    requireCustomer,
    handleErrors(async (req, res) => {
      const customer = await storage.getCustomerById(req.customer!.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Don't return the password
      const { password, ...customerWithoutPassword } = customer;
      res.json(customerWithoutPassword);
    })
  );

  app.put(
    `${apiPrefix}/customer/profile`,
    requireCustomer,
    handleErrors(async (req, res) => {
      const customerId = req.customer!.id;
      const customerData = req.body;

      // Remove password from update data (use separate endpoint for password updates)
      delete customerData.password;

      const customer = await storage.updateCustomer(customerId, customerData);
      
      // Don't return the password
      const { password, ...customerWithoutPassword } = customer;
      res.json(customerWithoutPassword);
    })
  );

  app.put(
    `${apiPrefix}/customer/password`,
    requireCustomer,
    handleErrors(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const customerId = req.customer!.id;

      const customer = await storage.getCustomerById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      await storage.updateCustomerPassword(customerId, newPassword);
      res.json({ message: "Password updated successfully" });
    })
  );

  // Order Routes
  app.get(
    `${apiPrefix}/orders`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const {
        status,
        customerId,
        startDate,
        endDate,
        page = "1",
        limit = "10",
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getAllOrders({
        status: status as string,
        customerId: customerId ? parseInt(customerId as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limitNum,
        offset,
      });

      res.json({
        orders: result.orders,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    })
  );

  app.get(
    `${apiPrefix}/customer/orders`,
    requireCustomer,
    handleErrors(async (req, res) => {
      const customerId = req.customer!.id;
      const { page = "1", limit = "10" } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getAllOrders({
        customerId,
        limit: limitNum,
        offset,
      });

      res.json({
        orders: result.orders,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    })
  );

  app.get(
    `${apiPrefix}/orders/:id`,
    optionalCustomer,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // If customer is requesting, ensure they can only access their own orders
      if (req.customer && order.customerId !== req.customer.id && !req.admin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(order);
    })
  );

  app.post(
    `${apiPrefix}/orders`,
    optionalCustomer,
    handleErrors(async (req, res) => {
      const { orderData, orderItems } = req.body;

      // If authenticated, associate order with customer
      if (req.customer) {
        orderData.customerId = req.customer.id;
      }

      const order = await storage.createOrder(orderData, orderItems);
      res.status(201).json(order);
    })
  );

  app.put(
    `${apiPrefix}/orders/:id/status`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    })
  );

  // Dashboard Stats
  app.get(
    `${apiPrefix}/admin/dashboard`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    })
  );

  const httpServer = createServer(app);

  return httpServer;
}
