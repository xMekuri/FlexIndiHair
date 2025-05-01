import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

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
      await db.insert(schema.categories).values([
        {
          name: "Clip-In Extensions",
          slug: "clip-in-extensions",
          description: "Easy to apply, perfect for beginners. Clip-in hair extensions are temporary and can be applied at home without professional help.",
          imageUrl: "https://images.unsplash.com/photo-1605980625600-88aa4a2021eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          isActive: true,
        },
        {
          name: "Tape-In Extensions",
          slug: "tape-in-extensions",
          description: "Semi-permanent extensions that last 6-8 weeks. Applied using adhesive tape for a natural look.",
          imageUrl: "https://images.unsplash.com/photo-1595257547083-096db5e2ac80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          isActive: true,
        },
        {
          name: "Halo Extensions",
          slug: "halo-extensions",
          description: "Unique and innovative, halo extensions sit on your head like a crown with a clear wire.",
          imageUrl: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          isActive: true,
        },
        {
          name: "Hair Care",
          slug: "hair-care",
          description: "Premium hair care products specially formulated for hair extensions to maintain their quality and longevity.",
          imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGFpciUyMGNhcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
          isActive: true,
        },
      ]);
    }

    // Fetch created categories for reference
    const categories = await db.select().from(schema.categories);
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));

    // Check if products exist, if not create them
    const existingProducts = await db.select().from(schema.products);
    if (existingProducts.length === 0) {
      console.log("Creating products...");

      // Clip-In Extensions
      await db.insert(schema.products).values([
        {
          name: "20-inch Clip-In Extensions",
          slug: "20-inch-clip-in-extensions",
          description: "Premium quality 20-inch clip-in hair extensions made with 100% real human hair. These extensions are easy to apply and remove, perfect for adding length and volume.",
          price: 129.99,
          sku: "CIE-001",
          stock: 50,
          mainImageUrl: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Clip-In Extensions")!,
          isActive: true,
          isFeatured: true,
          isNew: true,
          isOnSale: false,
        },
        {
          name: "16-inch Clip-In Extensions - Ombre",
          slug: "16-inch-clip-in-extensions-ombre",
          description: "Stunning ombre 16-inch clip-in hair extensions. Natural transition from dark to light for a fashionable look.",
          price: 119.99,
          sku: "CIE-002",
          stock: 35,
          mainImageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aGFpciUyMGV4dGVuc2lvbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Clip-In Extensions")!,
          isActive: true,
          isFeatured: false,
          isNew: false,
          isOnSale: false,
        },
      ]);

      // Tape-In Extensions
      await db.insert(schema.products).values([
        {
          name: "Tape-In Gold Series",
          slug: "tape-in-gold-series",
          description: "Our premium Tape-In Gold Series extensions are made with the finest quality human hair. These semi-permanent extensions last 6-8 weeks with proper care.",
          price: 179.99,
          compareAtPrice: 229.99,
          sku: "TIE-001",
          stock: 40,
          mainImageUrl: "https://images.unsplash.com/photo-1601497348644-c3d2568ca7d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Tape-In Extensions")!,
          isActive: true,
          isFeatured: true,
          isNew: false,
          isOnSale: true,
        },
        {
          name: "Tape-In Extensions - Wavy",
          slug: "tape-in-extensions-wavy",
          description: "Beautiful wavy tape-in extensions for a natural, beachy look. Made with 100% human hair for seamless blending.",
          price: 189.99,
          sku: "TIE-002",
          stock: 30,
          mainImageUrl: "https://images.unsplash.com/photo-1590329946928-f9b7593d8a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Tape-In Extensions")!,
          isActive: true,
          isFeatured: false,
          isNew: false,
          isOnSale: false,
        },
      ]);

      // Halo Extensions
      await db.insert(schema.products).values([
        {
          name: "Halo Extensions - Ombre",
          slug: "halo-extensions-ombre",
          description: "Innovative halo extensions with a beautiful ombre effect. No clips or glue needed, just place the invisible wire over your head.",
          price: 159.99,
          sku: "HAL-001",
          stock: 25,
          mainImageUrl: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Halo Extensions")!,
          isActive: true,
          isFeatured: true,
          isNew: false,
          isOnSale: false,
        },
        {
          name: "Halo Extensions - Straight",
          slug: "halo-extensions-straight",
          description: "Sleek and straight halo hair extensions. The innovative wire design makes application quick and easy with no damage to your natural hair.",
          price: 149.99,
          sku: "HAL-002",
          stock: 20,
          mainImageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFpciUyMGV4dGVuc2lvbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Halo Extensions")!,
          isActive: true,
          isFeatured: false,
          isNew: true,
          isOnSale: false,
        },
      ]);

      // Hair Care Products
      await db.insert(schema.products).values([
        {
          name: "Argan Oil Hair Mask",
          slug: "argan-oil-hair-mask",
          description: "Nourishing hair mask enriched with Argan oil to maintain and extend the life of your hair extensions. Keeps hair soft, shiny, and tangle-free.",
          price: 49.99,
          sku: "HC-001",
          stock: 60,
          mainImageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGFpciUyMGNhcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Hair Care")!,
          isActive: true,
          isFeatured: true,
          isNew: false,
          isOnSale: false,
        },
        {
          name: "Extension-Safe Shampoo",
          slug: "extension-safe-shampoo",
          description: "Gentle, sulfate-free shampoo specially formulated for hair extensions. Cleans without stripping or damaging the hair.",
          price: 29.99,
          sku: "HC-002",
          stock: 75,
          mainImageUrl: "https://images.unsplash.com/photo-1620331688629-a191b3989748?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhaXIlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Hair Care")!,
          isActive: true,
          isFeatured: false,
          isNew: false,
          isOnSale: false,
        },
        {
          name: "Extension Brush",
          slug: "extension-brush",
          description: "Specially designed brush for hair extensions. Prevents tangling and damage while keeping your extensions looking their best.",
          price: 19.99,
          sku: "HC-003",
          stock: 90,
          mainImageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhhaXIlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
          categoryId: categoryMap.get("Hair Care")!,
          isActive: true,
          isFeatured: false,
          isNew: false,
          isOnSale: false,
        },
      ]);
    }

    // Check if customers exist, if not create them
    const existingCustomers = await db.select().from(schema.customers);
    if (existingCustomers.length === 0) {
      console.log("Creating sample customers...");
      
      // Create 5 sample customers
      const customers = [];
      for (let i = 0; i < 5; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        customers.push({
          email: faker.internet.email({ firstName, lastName }),
          password: hashedPassword,
          firstName,
          lastName,
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: "United States",
        });
      }
      
      await db.insert(schema.customers).values(customers);
    }

    // Check if product reviews exist, if not create them
    const existingReviews = await db.select().from(schema.productReviews);
    if (existingReviews.length === 0) {
      console.log("Creating product reviews...");
      
      const customers = await db.select().from(schema.customers);
      const products = await db.select().from(schema.products);
      
      const reviews = [];
      
      // Create reviews for each product
      for (const product of products) {
        const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews per product
        
        for (let i = 0; i < numReviews; i++) {
          const customer = customers[Math.floor(Math.random() * customers.length)];
          const rating = Math.floor(Math.random() * 2) + 4; // 4-5 star ratings
          
          reviews.push({
            productId: product.id,
            customerId: customer.id,
            rating,
            comment: faker.lorem.paragraph(),
            createdAt: faker.date.recent({ days: 30 }),
          });
        }
      }
      
      await db.insert(schema.productReviews).values(reviews);
    }

    // Check if orders exist, if not create them
    const existingOrders = await db.select().from(schema.orders);
    if (existingOrders.length === 0) {
      console.log("Creating sample orders...");
      
      const customers = await db.select().from(schema.customers);
      const products = await db.select().from(schema.products);
      
      // Create 10 sample orders
      for (let i = 0; i < 10; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const orderItems = [];
        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        let subtotal = 0;
        
        // Create order items
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
          const price = parseFloat(product.price.toString());
          const totalPrice = price * quantity;
          
          orderItems.push({
            productId: product.id,
            quantity,
            price,
            totalPrice,
          });
          
          subtotal += totalPrice;
        }
        
        const tax = parseFloat((subtotal * 0.07).toFixed(2)); // 7% tax
        const shipping = 15.00;
        const total = parseFloat((subtotal + tax + shipping).toFixed(2));
        
        // Create the order
        const [order] = await db.insert(schema.orders).values({
          customerId: customer.id,
          status: ["pending", "processing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
            country: customer.country,
          },
          billingAddress: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
            country: customer.country,
          },
          paymentMethod: "credit_card",
          paymentStatus: Math.random() > 0.2 ? "paid" : "pending", // 80% paid, 20% pending
          createdAt: faker.date.recent({ days: 30 }),
        }).returning();
        
        // Add order items to the order
        await db.insert(schema.orderItems).values(
          orderItems.map(item => ({
            ...item,
            orderId: order.id,
          }))
        );
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
