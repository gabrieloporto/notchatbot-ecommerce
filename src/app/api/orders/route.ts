import { db } from "@/server/db";
import {
  orderItems,
  orders,
  products,
  shippingCosts,
} from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";

// Tipamos la estructura esperada del body
interface OrderItem {
  productId: number;
  quantity: number;
}

interface OrderBody {
  items: OrderItem[];
  postalCode: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderBody;
    const { items, postalCode } = body;

    if (!items || !postalCode || items.length === 0) {
      return new Response("Invalid order data", { status: 400 });
    }

    const productIds = items.map((item) => item.productId);
    const productsInDb = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productsMap = new Map(
      productsInDb.map((p) => [p.id, Number(p.price)]),
    );

    for (const item of items) {
      if (!productsMap.has(item.productId)) {
        return new Response(`Product ${item.productId} not found`, {
          status: 404,
        });
      }
    }

    const shipping = await db
      .select()
      .from(shippingCosts)
      .where(eq(shippingCosts.postalCode, postalCode));

    const shippingEntry = shipping[0];
    if (!shippingEntry) {
      return new Response("Shipping cost not found", { status: 404 });
    }

    const shippingCost = Number(shippingEntry.price);

    const subtotal = items.reduce((acc, item) => {
      const unitPrice = productsMap.get(item.productId)!;
      return acc + unitPrice * item.quantity;
    }, 0);

    const total = subtotal + shippingCost;

    // Insert order (con cast a string)
    const insertedOrders = await db
      .insert(orders)
      .values({
        total: total.toFixed(2),
        postalCode,
        shippingCost: shippingCost.toFixed(2),
        createdAt: new Date().toISOString(),
      })
      .returning({ id: orders.id });

    const order = insertedOrders[0];
    if (!order) {
      return new Response("Error creating order", { status: 500 });
    }

    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    return Response.json({ orderId: order.id, total });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
