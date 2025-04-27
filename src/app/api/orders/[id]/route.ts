import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  // Espera a que params esté disponible si es una promesa
  const params = await context.params;

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(params.id)))
      .limit(1);

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 },
    );
  }
}
