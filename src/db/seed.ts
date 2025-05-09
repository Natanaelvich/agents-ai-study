import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { seed } from 'drizzle-seed';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Drizzle instance
  const db = drizzle(pool, { schema });

  // Seed data with refinements for relationships
  await seed(db, {
    products: schema.products,
    customers: schema.customers,
    orders: schema.orders,
  }).refine((funcs) => ({
    // Products data
    products: {
      count: 20,
      columns: {
        name: funcs.companyName(),
        price: funcs.int({ minValue: 10, maxValue: 1000 }),
        stock: funcs.int({ minValue: 0, maxValue: 100 }),
      },
    },
    // Customers data
    customers: {
      count: 50,
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
        phone: funcs.phoneNumber({ template: "(##) #####-####" }),
      },
    },
    // Orders data with relationships
    orders: {
      count: 100,
      columns: {
        customerId: funcs.int({ minValue: 1, maxValue: 50 }),
        items: funcs.json(),
        totalAmount: funcs.int({ minValue: 100, maxValue: 10000 }),
        status: funcs.valuesFromArray({
          values: ['pending', 'processing', 'completed', 'cancelled'],
        }),
        address: funcs.streetAddress(),
      },
    },
  }));

  console.log('✨ Database seeded successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Failed to seed database:', err);
  process.exit(1);
}); 