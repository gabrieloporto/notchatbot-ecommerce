import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(10),
});

export const shippingCosts = pgTable("shipping_costs", {
  postalCode: text("postal_code").primaryKey(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(), 
  customerEmail: text("customer_email").notNull(), 
  customerName: text("customer_name").notNull(), 
  customerPhone: text("customer_phone").notNull(), 
  shippingAddress: text("shipping_address").notNull(), 
  shippingCity: text("shipping_city").notNull(), 
  shippingProvince: text("shipping_province").notNull(), 
  shippingPostalCode: text("shipping_postal_code"), 
  shippingMethod: text("shipping_method").notNull(), 
  shippingPrice: numeric("shipping_price", {
    precision: 10,
    scale: 2,
  }).notNull(), 
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(), 
  total: numeric("total", { precision: 10, scale: 2 }).notNull(), 
  status: text("status").notNull().default("pending"), 
  createdAt: timestamp("created_at").notNull().defaultNow(), 
  items: jsonb("items").notNull(), 
});