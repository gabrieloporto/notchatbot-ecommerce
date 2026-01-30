// Importa la instancia de la base de datos configurada con Drizzle ORM
import { db } from "@/server/db";

// Importa el esquema de la tabla de productos
import { products } from "@/server/db/schema";

// Importa NextResponse para manejar las respuestas HTTP en Next.js
import { NextResponse } from "next/server";

// Importa eq para las comparaciones en Drizzle
import { eq } from "drizzle-orm";

// Define el handler para el método GET en la ruta /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = db.select().from(products);

    // Filter by category if provided
    if (category) {
      // @ts-expect-error - Drizzle types might get complex with dynamic queries but this is valid
      query = db.select().from(products).where(eq(products.category, category));
    }

    // Consulta todos los productos de la base de datos
    const allProducts = await query;

    // Devuelve los productos en formato JSON con status 200
    return NextResponse.json(allProducts);
  } catch (error) {
    // Si ocurre un error, lo muestra en consola y responde con status 500
    console.error("Error al obtener productos:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

/*
Explicación

Propósito: Este endpoint expone una API REST para obtener todos los productos desde la base de datos.

Flujo:
1. Cuando se hace un GET a /api/products, ejecuta la función GET.
2. Usa Drizzle ORM para seleccionar todos los productos de la tabla products.
3. Devuelve los productos en formato JSON.
4. Si hay un error, responde con un mensaje y status 500.
*/
