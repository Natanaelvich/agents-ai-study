import { pgTable, serial, text, timestamp, integer, jsonb, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  items: jsonb('items').notNull(), // Array of { productId, quantity, price }
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, cancelled
  address: text('address').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  content: text('content').notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: json('metadata'),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
})); 