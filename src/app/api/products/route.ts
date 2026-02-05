// Import shared database query function
import { getProductsFromDb } from "@/server/db/queries/products";

// Importa NextResponse para manejar las respuestas HTTP en Next.js
import { NextResponse } from "next/server";

// Define el handler para el método GET en la ruta /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    // Use shared database query function
    const allProducts = await getProductsFromDb(category);

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
