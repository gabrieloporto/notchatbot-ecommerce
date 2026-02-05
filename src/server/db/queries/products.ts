import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  stock: number;
  category: string;
}

/**
 * Fetches products from the database
 * @param category - Optional category filter
 * @returns Array of products
 */
export async function getProductsFromDb(category?: string): Promise<Product[]> {
  try {
    let query;
    
    if (category) {
      query = db.select().from(products).where(eq(products.category, category));
    } else {
      query = db.select().from(products);
    }
    
    const result = await query;
    return result;
  } catch (error) {
    console.error("Error fetching products from database:", error);
    throw new Error("Failed to fetch products");
  }
}
