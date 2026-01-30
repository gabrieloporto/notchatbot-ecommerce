import { db } from "@/server/db"; // Instancia de la base de datos
import { shippingCosts } from "@/server/db/schema"; // Esquema de costos de envío
import { eq } from "drizzle-orm"; // Helper para condiciones SQL
import { NextResponse } from "next/server"; // Respuestas HTTP Next.js
import type { NextRequest } from "next/server"; // Tipado para la request

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ cp: string }> },
) {
  // Extrae el código postal de los parámetros de la ruta
  const { cp } = await context.params;

  // Busca el costo de envío para ese código postal
  const result = await db
    .select()
    .from(shippingCosts)
    .where(eq(shippingCosts.postalCode, cp))
    .limit(1);

  // Obtiene el precio si existe
  const price = result[0]?.price;

  // Si no hay precio para ese CP, responde con 404
  if (price == null) {
    return NextResponse.json(
      { error: "Postal code not found" },
      { status: 404 },
    );
  }

  // Devuelve el precio encontrado
  return NextResponse.json({ price });
}

/*
Explicación

Propósito: Permite consultar el costo de envío para un código postal específico.

Flujo:
1. Extrae el parámetro cp (código postal) de la URL.
2. Busca en la tabla shippingCosts el precio asociado a ese código postal.
3. Si lo encuentra, devuelve el precio en formato JSON.
4. Si no existe, responde con un error 404.
*/
