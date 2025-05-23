import { db, pool } from "@db";
import * as schema from "@shared/schema";
import { eq, and, or, desc, asc, like, gte, lte, isNull, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const storage = {
  // Admin functions
  async getAdminByEmail(email: string) {
    return await db.query.admins.findFirst({
      where: eq(schema.admins.email, email),
    });
  },
  
  async createAdmin(admin: schema.AdminInsert) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [newAdmin] = await db.insert(schema.admins)
      .values({...admin, password: hashedPassword})
      .returning();
    return newAdmin;
  },
  
  // Category functions
  async getAllCategories(params?: {active?: boolean}) {
    let query = db.select().from(schema.categories);
    
    if (params?.active) {
      query = query.where(eq(schema.categories.isActive, true));
    }
    
    return await query.orderBy(asc(schema.categories.name));
  },
  
  async getCategoryById(id: number) {
    return await db.query.categories.findFirst({
      where: eq(schema.categories.id, id),
    });
  },
  
  async getCategoryBySlug(slug: string) {
    return await db.query.categories.findFirst({
      where: eq(schema.categories.slug, slug),
    });
  },
  
  async createCategory(category: schema.CategoryInsert) {
    const [newCategory] = await db.insert(schema.categories)
      .values(category)
      .returning();
    return newCategory;
  },
  
  async updateCategory(id: number, category: Partial<schema.CategoryInsert>) {
    const [updatedCategory] = await db.update(schema.categories)
      .set({...category, updatedAt: new Date()})
      .where(eq(schema.categories.id, id))
      .returning();
    return updatedCategory;
  },
  
  async deleteCategory(id: number) {
    return await db.delete(schema.categories)
      .where(eq(schema.categories.id, id));
  },
  
  // Product functions
  async getAllProducts(params?: {
    active?: boolean, 
    categoryId?: number,
    category?: string, // Category slug
    featured?: boolean,
    search?: string,
    limit?: number,
    offset?: number,
    sort?: string
  }) {
    let query = db.select().from(schema.products);
    
    // Apply filters
    if (params?.active) {
      query = query.where(eq(schema.products.isActive, true));
    }
    
    if (params?.categoryId) {
      query = query.where(eq(schema.products.categoryId, params.categoryId));
    }
    
    // Filter by category slug if provided
    if (params?.category) {
      // First find the category id from the slug
      const category = await db.select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, params.category))
        .limit(1);
      
      if (category.length > 0) {
        const categoryId = category[0].id;
        
        // Check if this is a main category (parent category)
        // If so, we need to get all subcategories and include their products too
        const subcategories = await db.select()
          .from(schema.categories)
          .where(eq(schema.categories.parent_id, categoryId));
        
        if (subcategories.length > 0) {
          // This is a parent category with subcategories
          // Get products from both the parent category and all its subcategories
          const subcategoryIds = subcategories.map(subcat => subcat.id);
          query = query.where(
            or(
              eq(schema.products.categoryId, categoryId),
              inArray(schema.products.categoryId, subcategoryIds)
            )
          );
        } else {
          // This is a subcategory or a category without subcategories
          query = query.where(eq(schema.products.categoryId, categoryId));
        }
      }
    }
    
    if (params?.featured) {
      query = query.where(eq(schema.products.isFeatured, true));
    }
    
    if (params?.search) {
      query = query.where(
        or(
          like(schema.products.name, `%${params.search}%`),
          like(schema.products.description, `%${params.search}%`)
        )
      );
    }
    
    // Apply sorting
    if (params?.sort) {
      const [field, direction] = params.sort.split('_');
      if (field === 'price') {
        query = query.orderBy(direction === 'desc' ? desc(schema.products.price) : asc(schema.products.price));
      } else if (field === 'name') {
        query = query.orderBy(direction === 'desc' ? desc(schema.products.name) : asc(schema.products.name));
      } else if (field === 'createdAt') {
        query = query.orderBy(direction === 'desc' ? desc(schema.products.createdAt) : asc(schema.products.createdAt));
      } else {
        query = query.orderBy(desc(schema.products.createdAt));
      }
    } else {
      query = query.orderBy(desc(schema.products.createdAt));
    }
    
    // Apply pagination
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    const products = await query;
    
    // Get the total count for pagination
    const countQuery = db.select({
      count: sql<number>`count(*)`
    }).from(schema.products);
    
    // Apply the same filters to the count query
    let countFiltered = countQuery;
    
    if (params?.active) {
      countFiltered = countFiltered.where(eq(schema.products.isActive, true));
    }
    
    if (params?.categoryId) {
      countFiltered = countFiltered.where(eq(schema.products.categoryId, params.categoryId));
    }
    
    // We already found the category id above, so we use the same condition for both queries
    if (params?.category && !params?.categoryId) {
      // Look up the category by slug
      const category = await db.select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, params.category))
        .limit(1);
      
      if (category.length > 0) {
        const categoryId = category[0].id;
        
        // Check if this is a main category with subcategories
        const subcategories = await db.select()
          .from(schema.categories)
          .where(eq(schema.categories.parent_id, categoryId));
        
        if (subcategories.length > 0) {
          // This is a parent category with subcategories
          const subcategoryIds = subcategories.map(subcat => subcat.id);
          countFiltered = countFiltered.where(
            or(
              eq(schema.products.categoryId, categoryId),
              inArray(schema.products.categoryId, subcategoryIds)
            )
          );
        } else {
          // This is a subcategory or a category without subcategories
          countFiltered = countFiltered.where(eq(schema.products.categoryId, categoryId));
        }
      }
    }
    
    if (params?.featured) {
      countFiltered = countFiltered.where(eq(schema.products.isFeatured, true));
    }
    
    if (params?.search) {
      countFiltered = countFiltered.where(
        or(
          like(schema.products.name, `%${params.search}%`),
          like(schema.products.description, `%${params.search}%`)
        )
      );
    }
    
    const [{ count }] = await countFiltered;
    
    // Log the query parameters and result count for debugging
    console.log("Product query params:", params, "Found products:", products.length, "Total count:", count);
    
    return {
      products,
      total: count,
    };
  },
  
  async getProductById(id: number) {
    return await db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        category: true,
        productImages: {
          orderBy: asc(schema.productImages.sortOrder),
        },
        productReviews: {
          with: {
            customer: true,
          },
          orderBy: desc(schema.productReviews.createdAt),
        },
      },
    });
  },
  
  async getProductBySlug(slug: string) {
    return await db.query.products.findFirst({
      where: eq(schema.products.slug, slug),
      with: {
        category: true,
        productImages: {
          orderBy: asc(schema.productImages.sortOrder),
        },
        productReviews: {
          with: {
            customer: true,
          },
          orderBy: desc(schema.productReviews.createdAt),
        },
      },
    });
  },
  
  async createProduct(product: schema.ProductInsert) {
    const [newProduct] = await db.insert(schema.products)
      .values(product)
      .returning();
    return newProduct;
  },
  
  async updateProduct(id: number, product: Partial<schema.ProductInsert>) {
    const [updatedProduct] = await db.update(schema.products)
      .set({...product, updatedAt: new Date()})
      .where(eq(schema.products.id, id))
      .returning();
    return updatedProduct;
  },
  
  async deleteProduct(id: number) {
    return await db.delete(schema.products)
      .where(eq(schema.products.id, id));
  },
  
  // Product Images
  async addProductImage(productImage: schema.ProductImageInsert) {
    const [newImage] = await db.insert(schema.productImages)
      .values(productImage)
      .returning();
    return newImage;
  },
  
  async deleteProductImage(id: number) {
    return await db.delete(schema.productImages)
      .where(eq(schema.productImages.id, id));
  },
  
  // Product Reviews
  async getProductReviews(productId: number) {
    return await db.query.productReviews.findMany({
      where: eq(schema.productReviews.productId, productId),
      with: {
        customer: true,
      },
      orderBy: desc(schema.productReviews.createdAt),
    });
  },
  
  async addProductReview(review: schema.ProductReviewInsert) {
    const [newReview] = await db.insert(schema.productReviews)
      .values(review)
      .returning();
    return newReview;
  },
  
  // Customer functions
  async getAllCustomers(params?: {
    search?: string,
    limit?: number,
    offset?: number,
  }) {
    let query = db.select().from(schema.customers);
    
    if (params?.search) {
      query = query.where(
        or(
          like(schema.customers.firstName, `%${params.search}%`),
          like(schema.customers.lastName, `%${params.search}%`),
          like(schema.customers.email, `%${params.search}%`)
        )
      );
    }
    
    // Apply pagination
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    query = query.orderBy(desc(schema.customers.createdAt));
    
    const customers = await query;
    
    // Get the total count for pagination
    const countQuery = db.select({
      count: sql<number>`count(*)`
    }).from(schema.customers);
    
    let countFiltered = countQuery;
    
    if (params?.search) {
      countFiltered = countFiltered.where(
        or(
          like(schema.customers.firstName, `%${params.search}%`),
          like(schema.customers.lastName, `%${params.search}%`),
          like(schema.customers.email, `%${params.search}%`)
        )
      );
    }
    
    const [{ count }] = await countFiltered;
    
    return {
      customers,
      total: count,
    };
  },
  
  async getCustomerById(id: number) {
    return await db.query.customers.findFirst({
      where: eq(schema.customers.id, id),
      with: {
        orders: {
          orderBy: desc(schema.orders.createdAt),
        },
        productReviews: {
          with: {
            product: true,
          },
          orderBy: desc(schema.productReviews.createdAt),
        },
      },
    });
  },
  
  async getCustomerByEmail(email: string) {
    return await db.query.customers.findFirst({
      where: eq(schema.customers.email, email),
    });
  },
  
  async createCustomer(customer: schema.CustomerInsert) {
    const hashedPassword = await bcrypt.hash(customer.password, 10);
    const [newCustomer] = await db.insert(schema.customers)
      .values({...customer, password: hashedPassword})
      .returning();
    return newCustomer;
  },
  
  async updateCustomer(id: number, customer: Partial<Omit<schema.CustomerInsert, 'password'>>) {
    const [updatedCustomer] = await db.update(schema.customers)
      .set({...customer, updatedAt: new Date()})
      .where(eq(schema.customers.id, id))
      .returning();
    return updatedCustomer;
  },
  
  async updateCustomerPassword(id: number, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [updatedCustomer] = await db.update(schema.customers)
      .set({password: hashedPassword, updatedAt: new Date()})
      .where(eq(schema.customers.id, id))
      .returning();
    return updatedCustomer;
  },
  
  // Order functions
  async getAllOrders(params?: {
    status?: string,
    customerId?: number,
    search?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    offset?: number,
  }) {
    let query = db.select().from(schema.orders);
    
    if (params?.status && params.status !== 'all') {
      query = query.where(eq(schema.orders.status, params.status));
    }
    
    if (params?.customerId) {
      query = query.where(eq(schema.orders.user_id, params.customerId));
    }
    
    if (params?.startDate) {
      query = query.where(gte(schema.orders.createdAt, params.startDate));
    }
    
    if (params?.endDate) {
      query = query.where(lte(schema.orders.createdAt, params.endDate));
    }
    
    // Apply pagination
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    query = query.orderBy(desc(schema.orders.createdAt));
    
    const orders = await query;
    
    // Get the total count for pagination
    const countQuery = db.select({
      count: sql<number>`count(*)`
    }).from(schema.orders);
    
    let countFiltered = countQuery;
    
    if (params?.status && params.status !== 'all') {
      countFiltered = countFiltered.where(eq(schema.orders.status, params.status));
    }
    
    if (params?.customerId) {
      countFiltered = countFiltered.where(eq(schema.orders.user_id, params.customerId));
    }
    
    if (params?.startDate) {
      countFiltered = countFiltered.where(gte(schema.orders.createdAt, params.startDate));
    }
    
    if (params?.endDate) {
      countFiltered = countFiltered.where(lte(schema.orders.createdAt, params.endDate));
    }
    
    const [{ count }] = await countFiltered;
    
    return {
      orders,
      total: count,
    };
  },
  
  async getOrderById(id: number) {
    return await db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
      with: {
        customer: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
  },
  
  async createOrder(orderData: schema.OrderInsert, items: schema.OrderItemInsert[]) {
    try {
      console.log("Creating order with data:", JSON.stringify({ orderData, items }, null, 2));
      
      // Create a direct insert object without relying on schema validation for timestamps
      // This ensures we don't trigger the toISOString error
      const orderInsertData = {
        user_id: null, // Allow guest checkout
        order_number: orderData.orderNumber || `ORD-${Date.now()}`,
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        email: orderData.email,
        phone: orderData.phone || '',
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zip_code: orderData.zipCode,
        country: orderData.country,
        order_notes: orderData.orderNotes || '',
        status: orderData.status || 'pending',
        subtotal: typeof orderData.subtotal === 'number' ? orderData.subtotal.toString() : orderData.subtotal,
        shipping: typeof orderData.shipping === 'number' ? orderData.shipping.toString() : orderData.shipping,
        total: typeof orderData.total === 'number' ? orderData.total.toString() : orderData.total,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus || 'pending',
        // Let the database use its default NOW() for created_at
      };
      
      console.log("Raw order insert data:", orderInsertData);
      
      // Use raw SQL to insert the order, avoiding all schema validation
      const result = await pool.query(
        `INSERT INTO orders (
          user_id, order_number, first_name, last_name, email, phone, 
          address, city, state, zip_code, country, order_notes,
          status, subtotal, shipping, total, payment_method, payment_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *`,
        [
          orderInsertData.user_id,
          orderInsertData.order_number,
          orderInsertData.first_name,
          orderInsertData.last_name, 
          orderInsertData.email,
          orderInsertData.phone,
          orderInsertData.address,
          orderInsertData.city,
          orderInsertData.state,
          orderInsertData.zip_code,
          orderInsertData.country,
          orderInsertData.order_notes,
          orderInsertData.status,
          orderInsertData.subtotal,
          orderInsertData.shipping,
          orderInsertData.total,
          orderInsertData.payment_method,
          orderInsertData.payment_status
        ]
      );
      
      const newOrder = result.rows[0];
      console.log("Order created using raw SQL:", newOrder);
      
      // Process order items similarly using raw SQL
      for (const item of items) {
        // Convert price and totalPrice to strings if they're numbers
        const price = typeof item.price === 'number' ? item.price.toString() : item.price;
        const totalPrice = typeof item.totalPrice === 'number' ? item.totalPrice.toString() : item.totalPrice;
        
        await pool.query(
          `INSERT INTO order_items (
            order_id, product_id, name, price, quantity, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [newOrder.id, item.productId, item.name, price, item.quantity, totalPrice]
        );
      }
      
      console.log("Order items inserted successfully");
      
      // Return the created order
      return await this.getOrderById(newOrder.id);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },
  
  async updateOrderStatus(id: number, status: string) {
    try {
      console.log(`Starting order status update for order ${id} to ${status}`);
      
      // Skip the complex validation and just update the status directly
      // This avoids potential issues with the toISOString error
      const [updatedOrder] = await db.update(schema.orders)
        .set({ status })
        .where(eq(schema.orders.id, id))
        .returning();
      
      if (!updatedOrder) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      console.log(`Successfully updated order ${id} status to ${status}`);
      return updatedOrder;
    } catch (error) {
      console.error(`Error updating order status for order ${id}:`, error);
      throw error;
    }
  },
  
  // Dashboard stats
  async getDashboardStats() {
    // Total orders count
    const [orderCount] = await db.select({
      count: sql<number>`count(*)`
    }).from(schema.orders);
    
    // Total revenue
    const [revenue] = await db.select({
      total: sql<string>`sum(total)`
    }).from(schema.orders)
    .where(eq(schema.orders.paymentStatus, 'paid'));
    
    // Total customers
    const [customerCount] = await db.select({
      count: sql<number>`count(*)`
    }).from(schema.customers);
    
    // Total products
    const [productCount] = await db.select({
      count: sql<number>`count(*)`
    }).from(schema.products);
    
    // Recent orders
    const recentOrders = await db.select().from(schema.orders)
      .orderBy(desc(schema.orders.createdAt))
      .limit(5);
    
    // Low stock products
    const lowStockProducts = await db.select().from(schema.products)
      .where(lte(schema.products.stock, 10))
      .orderBy(asc(schema.products.stock))
      .limit(5);
    
    // Recent customers
    const recentCustomers = await db.select().from(schema.customers)
      .orderBy(desc(schema.customers.createdAt))
      .limit(5);
    
    return {
      orderCount: orderCount.count,
      revenue: revenue.total || '0',
      customerCount: customerCount.count,
      productCount: productCount.count,
      recentOrders,
      lowStockProducts,
      recentCustomers,
    };
  }
};
