import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface OrderRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  shippingMethod: string;
  shippingPrice: number;
  subtotal: number;
  total: number;
  items: Array<{
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const order = await db
      .insert(orders)
      .values({
        customerEmail: body.email,
        customerName: `${body.firstName} ${body.lastName}`,
        customerPhone: body.phone,
        shippingAddress: body.address,
        shippingCity: body.city,
        shippingProvince: body.province,
        shippingPostalCode: body.postalCode,
        shippingMethod: body.shippingMethod,
        shippingPrice: body.shippingPrice,
        subtotal: body.subtotal,
        total: body.total,
        items: body.items,
        status: "pending",
      })
      .returning();

    return NextResponse.json(order[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email))
      .orderBy(orders.createdAt);

    return NextResponse.json(userOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 },
    );
  }
}
