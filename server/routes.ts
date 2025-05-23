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
        category, // Add support for filtering by category slug
        featured,
        search,
        page = "1",
        limit = "12",
        sort,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Only filter by active if the parameter is explicitly provided
      const params: any = {
        limit: limitNum,
        offset,
        sort: sort as string,
      };
      
      if (active !== undefined) {
        params.active = active === "true";
      }
      
      if (categoryId) {
        params.categoryId = parseInt(categoryId as string);
      }
      
      // Support filtering by category slug
      if (category) {
        params.category = category as string;
      }
      
      if (featured !== undefined) {
        params.featured = featured === "true";  
      }
      
      if (search) {
        params.search = search as string;
      }
      
      console.log("Product API request params:", params);
      const result = await storage.getAllProducts(params);

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
      // Convert types as needed before validation
      const productData = {
        ...req.body,
        // Convert numerical strings to numbers if needed
        price: typeof req.body.price === 'number' 
          ? req.body.price.toString() 
          : req.body.price,
        compareAtPrice: req.body.compareAtPrice 
          ? req.body.compareAtPrice.toString()
          : null,
        // Use stockQuantity or fallback to stock for backward compatibility
        stockQuantity: req.body.stockQuantity 
          ? parseInt(req.body.stockQuantity.toString()) 
          : (req.body.stock ? parseInt(req.body.stock.toString()) : 0),
        categoryId: parseInt(req.body.categoryId.toString()),
        // Convert boolean strings to actual booleans
        isActive: req.body.isActive === true || req.body.isActive === "true",
        isFeatured: req.body.isFeatured === true || req.body.isFeatured === "true", 
        isNew: req.body.isNew === true || req.body.isNew === "true",
        isOnSale: req.body.isOnSale === true || req.body.isOnSale === "true",
        isBestSeller: req.body.isBestSeller === true || req.body.isBestSeller === "true",
      };
      
      console.log("Pre-validation product data:", productData);
      
      // Validate the product data
      const validatedData = schema.productInsertSchema.parse(productData);

      // Make a new product object with the validated data
      const newProductData = { ...validatedData };
      
      // Add main image if uploaded
      if (req.file) {
        newProductData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Make sure we use the imageUrl from the form if available
      if (productData.imageUrl && !newProductData.imageUrl) {
        newProductData.imageUrl = productData.imageUrl;
      }

      console.log("Creating product with data:", newProductData);
      const product = await storage.createProduct(newProductData);
      res.status(201).json(product);
    })
  );

  app.put(
    `${apiPrefix}/products/:id`,
    requireAdmin,
    upload.single("mainImage"),
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);

      // Convert types as needed before validation
      const productData = {
        ...req.body,
        // Convert numerical strings to numbers if needed
        price: typeof req.body.price === 'number' 
          ? req.body.price.toString() 
          : req.body.price,
        compareAtPrice: req.body.compareAtPrice 
          ? req.body.compareAtPrice.toString()
          : null,
        // Use stockQuantity or fallback to stock for backward compatibility
        stockQuantity: req.body.stockQuantity 
          ? parseInt(req.body.stockQuantity.toString()) 
          : (req.body.stock ? parseInt(req.body.stock.toString()) : undefined),
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId.toString()) : undefined,
        // Convert boolean strings to actual booleans
        isActive: req.body.isActive === true || req.body.isActive === "true",
        isFeatured: req.body.isFeatured === true || req.body.isFeatured === "true", 
        isNew: req.body.isNew === true || req.body.isNew === "true",
        isOnSale: req.body.isOnSale === true || req.body.isOnSale === "true",
        isBestSeller: req.body.isBestSeller === true || req.body.isBestSeller === "true",
      };

      // Add main image if uploaded
      if (req.file) {
        productData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Make sure we use the imageUrl from the form if already set
      if (req.body.imageUrl && !productData.imageUrl) {
        productData.imageUrl = req.body.imageUrl;
      }

      console.log("Updating product with data:", productData);
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
      try {
        console.log("Order creation request received:", req.body);
        const { orderData, orderItems } = req.body;

        if (!orderData) {
          return res.status(400).json({ error: "Missing orderData in request body" });
        }

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
          return res.status(400).json({ error: "Missing or invalid orderItems in request body" });
        }

        // If authenticated, associate order with customer
        if (req.customer) {
          console.log("Authenticated customer creating order:", req.customer);
          orderData.customerId = req.customer.id;
          orderData.user_id = req.customer.id; // Add both for compatibility
        }

        console.log("Creating order with data:", { orderData, orderItems });
        const order = await storage.createOrder(orderData, orderItems);
        console.log("Order created successfully:", order);
        res.status(201).json(order);
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ 
          error: "Failed to create order", 
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    })
  );

  app.put(
    `${apiPrefix}/orders/:id/status`,
    requireAdmin,
    handleErrors(async (req, res) => {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      // Simply update the order status without delivery date (removed column)
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
