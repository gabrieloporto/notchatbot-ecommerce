import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  // Extrae el parámetro id de la ruta (puede ser Promise o valor directo)
  const params = await context.params;

  try {
    // Busca la orden por id en la base de datos
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(params.id)))
      .limit(1);

    // Si no existe, responde con 404
    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Devuelve la orden encontrada
    return NextResponse.json(order[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 },
    );
  }
}

/*
Explicación

Propósito: Permite obtener los detalles de una orden específica usando su ID.

Flujo:
1. Extrae el parámetro id de la URL.
2. Busca en la base de datos la orden con ese ID.
3. Si no la encuentra, responde con 404.
4. Si la encuentra, devuelve la orden en formato JSON.
*/
