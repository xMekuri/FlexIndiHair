import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User authentication tables
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product-related tables
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  parent_id: integer("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  ingredients: text("ingredients"),
  howToUse: text("how_to_use"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  sku: text("sku").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isOnSale: boolean("is_on_sale").default(false).notNull(),
  hairType: text("hair_type"),
  concerns: text("concerns"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order-related tables
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => customers.id),
  orderNumber: text("order_number"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  orderNotes: text("order_notes"),
  status: text("status").notNull().default("pending"), // pending, processing, out_for_delivery, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Define relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  productImages: many(productImages),
  productReviews: many(productReviews),
  orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
    relationName: 'parentCategory'
  }),
  subcategories: many(categories, {
    relationName: 'parentCategory'
  })
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  productReviews: many(productReviews),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  orderItems: many(orderItems),
  customer: one(customers, {
    fields: [orders.user_id],
    references: [customers.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  customer: one(customers, {
    fields: [productReviews.customerId],
    references: [customers.id],
  }),
}));

// Validation schemas
export const adminInsertSchema = createInsertSchema(admins, {
  email: (schema) => schema.email("Please enter a valid email address"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters long"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters long"),
});

export const customerInsertSchema = createInsertSchema(customers, {
  email: (schema) => schema.email("Please enter a valid email address"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters long"),
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters long"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters long"),
});

export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Category name must be at least 2 characters long"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters long"),
});

export const productInsertSchema = createInsertSchema(products, {
  name: (schema) => schema.min(2, "Product name must be at least 2 characters long"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters long"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters long"),
  price: (schema) => schema.refine((val) => parseFloat(String(val)) > 0, { message: "Price must be positive" }),
});

export const productImageInsertSchema = createInsertSchema(productImages);
export const productReviewInsertSchema = createInsertSchema(productReviews);

// Custom order insert schema with date handling and numeric conversions
export const orderInsertSchema = createInsertSchema(orders, {
  // Handle createdAt
  createdAt: z.preprocess(
    (val) => {
      // If the value is already a string, return it
      if (typeof val === 'string') return val;
      
      // If it's a Date object, convert to ISO string
      if (val instanceof Date) return val.toISOString();
      
      // Ensure we have a valid date (even if undefined/null)
      return new Date().toISOString();
    },
    z.string().optional()
  ),
  // Handle monetary values that may come as numbers but need to be strings
  subtotal: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  shipping: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  total: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  )
});

// Custom order item insert schema with numeric conversions
export const orderItemInsertSchema = createInsertSchema(orderItems, {
  // Handle monetary values that may come as numbers but need to be strings
  price: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  totalPrice: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  )
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Type definitions for easier usage
export type Admin = typeof admins.$inferSelect;
export type AdminInsert = z.infer<typeof adminInsertSchema>;

export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = z.infer<typeof customerInsertSchema>;

export type Category = typeof categories.$inferSelect;
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;

export type Product = typeof products.$inferSelect;
export type ProductInsert = z.infer<typeof productInsertSchema>;

export type ProductImage = typeof productImages.$inferSelect;
export type ProductImageInsert = z.infer<typeof productImageInsertSchema>;

export type ProductReview = typeof productReviews.$inferSelect;
export type ProductReviewInsert = z.infer<typeof productReviewInsertSchema>;

export type Order = typeof orders.$inferSelect;
export type OrderInsert = z.infer<typeof orderInsertSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type OrderItemInsert = z.infer<typeof orderItemInsertSchema>;

export type Login = z.infer<typeof loginSchema>;
