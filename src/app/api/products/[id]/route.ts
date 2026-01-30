import { db } from "@/server/db"; // Instancia de la base de datos
import { products } from "@/server/db/schema"; // Esquema de productos
import { eq } from "drizzle-orm"; // Helper para condiciones SQL
import { NextResponse } from "next/server"; // Respuestas HTTP Next.js
import type { NextRequest } from "next/server"; // Tipado para la request

// Handler para GET /api/products/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Extrae el id de los parámetros de la ruta
  const { id } = await params;
  const productId = parseInt(id);

  // Valida que el id sea un número válido
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  // Busca el producto por id en la base de datos
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  // Si no existe, responde con 404
  if (!product.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Devuelve el producto encontrado
  return NextResponse.json(product[0]);
}

/*
Explicación

Propósito: Permite obtener los detalles de un producto específico usando su ID.

Flujo:
1. Extrae el parámetro id de la URL.
2. Valida que el ID sea un número.
3 .Consulta la base de datos buscando el producto con ese ID.
4. Si no lo encuentra, responde con 404.
5. Si lo encuentra, devuelve el producto en formato JSON.
*/
