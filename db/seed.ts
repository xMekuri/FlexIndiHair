import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Check if admin exists, if not create one
    const existingAdmins = await db.select().from(schema.admins);
    if (existingAdmins.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(schema.admins).values({
        email: "admin@flexindihair.com",
        password: hashedPassword,
        name: "Admin User",
      });
    }

    // Check if categories exist, if not create them
    const existingCategories = await db.select().from(schema.categories);
    if (existingCategories.length === 0) {
      console.log("Creating categories...");
      await db.execute(
        `INSERT INTO categories (name, slug, description, image_url) 
         VALUES 
         ('Shampoo', 'shampoo', 'High-quality shampoo for different hair types', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388'),
         ('Conditioner', 'conditioner', 'Nourishing conditioners for all hair types', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d'),
         ('Hair Oils', 'hair-oils', 'Healing and therapeutic oils for hair', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908')
        `
      );
    }

    // Fetch created categories for reference
    const categories = await db.select().from(schema.categories);
    console.log("Categories:", categories);

    // Check if products exist, if not create them
    const existingProducts = await db.select().from(schema.products);
    if (existingProducts.length === 0 && categories.length > 0) {
      console.log("Creating products...");
      
      // Find the category IDs
      const shampooCategory = categories.find(c => c.slug === 'shampoo');
      const conditionerCategory = categories.find(c => c.slug === 'conditioner');
      const oilsCategory = categories.find(c => c.slug === 'hair-oils');
      
      if (shampooCategory && conditionerCategory && oilsCategory) {
        await db.execute(
          `INSERT INTO products (
            name, slug, description, price, sku, image_url, category_id, 
            is_active, is_featured, is_best_seller, is_new, is_on_sale,
            stock_quantity
          ) 
          VALUES 
          (
            'Moisturizing Shampoo', 
            'moisturizing-shampoo', 
            'Deeply moisturizing shampoo for dry hair',
            19.99,
            'SH-001',
            'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232',
            ${shampooCategory.id},
            true, true, true, false, false,
            100
          ),
          (
            'Gentle Conditioner', 
            'gentle-conditioner', 
            'Gentle conditioning for all hair types',
            24.99,
            'CD-001',
            'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc',
            ${conditionerCategory.id},
            true, false, false, true, false,
            75
          ),
          (
            'Argan Hair Oil', 
            'argan-hair-oil', 
            'Premium argan oil for hair therapy',
            34.99,
            'OL-001',
            'https://images.unsplash.com/photo-1559830772-73d4faef7125',
            ${oilsCategory.id},
            true, false, false, false, true,
            50
          )
          `
        );
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
