import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { automationEvents, orders } from "@/server/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
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

    const foundOrder = order[0]!;

    const events = await db
      .select()
      .from(automationEvents)
      .where(eq(automationEvents.orderId, foundOrder.id))
      .orderBy(asc(automationEvents.createdAt));

    // Devuelve la orden encontrada con trazabilidad del bot
    return NextResponse.json({
      ...foundOrder,
      automationEvents: events,
      automationSummary: {
        totalEvents: events.length,
        lastEvent: events.at(-1) ?? null,
        automated:
          foundOrder.status === "ready_for_fulfillment" ||
          foundOrder.status === "manual_review",
      },
    });
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
