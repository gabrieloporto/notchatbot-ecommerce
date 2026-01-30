import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// Tabla de productos
export const products = pgTable("products", {
  id: serial("id").primaryKey(), // ID autoincremental
  name: text("name").notNull(), // Nombre del producto
  description: text("description"), // Descripción
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Precio
  image: text("image"), // URL de la imagen
  category: text("category").notNull(), // Categoría del producto
  stock: integer("stock").notNull().default(10), // Stock disponible
});

// Tabla de costos de envío por código postal
export const shippingCosts = pgTable("shipping_costs", {
  postalCode: text("postal_code").primaryKey(), // Código postal (PK)
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Costo de envío
});

// Tabla de órdenes
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(), // ID autoincremental
  customerEmail: text("customer_email").notNull(), // Email del cliente
  customerName: text("customer_name").notNull(), // Nombre completo
  customerPhone: text("customer_phone").notNull(), // Teléfono
  shippingAddress: text("shipping_address").notNull(), // Dirección
  shippingCity: text("shipping_city").notNull(), // Ciudad
  shippingProvince: text("shipping_province").notNull(), // Provincia
  shippingPostalCode: text("shipping_postal_code"), // Código postal
  shippingMethod: text("shipping_method").notNull(), // Método de envío
  shippingPrice: numeric("shipping_price", {
    precision: 10,
    scale: 2,
  }).notNull(), // Precio de envío
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(), // Subtotal de la orden
  total: numeric("total", { precision: 10, scale: 2 }).notNull(), // Total de la orden
  status: text("status").notNull().default("pending"), // Estado de la orden
  createdAt: timestamp("created_at").notNull().defaultNow(), // Fecha de creación
  items: jsonb("items").notNull(), // Productos de la orden (array en JSON)
});

/*
Resumen de cada tabla
products:
Guarda los productos disponibles en la tienda.

shippingCosts:
Relaciona cada código postal con un costo de envío específico.

orders:
Guarda la información de cada orden, incluyendo datos del cliente, dirección, método y costo de envío, subtotal, total, estado y los productos comprados (en formato JSON).
*/
