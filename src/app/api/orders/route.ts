import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Interfaz para tipar la orden recibida en el body
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

// POST /api/orders - Crea una nueva orden
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    // Validación básica
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Inserta la orden en la base de datos
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

    // Devuelve la orden creada
    return NextResponse.json(order[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 },
    );
  }
}

// GET /api/orders?email=... - Obtiene las órdenes de un usuario por email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Validación básica
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Busca las órdenes del usuario por email
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email))
      .orderBy(orders.createdAt);

    // Devuelve las órdenes encontradas
    return NextResponse.json(userOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 },
    );
  }
}

/*
Explicación

POST:
1. Recibe los datos de la orden en el body.
2. Valida que el email esté presente.
3. Inserta la orden en la base de datos con estado "pending".
4. Devuelve la orden creada.

GET:
1. Recibe el email como query param.
2. Busca todas las órdenes asociadas a ese email.
3. Devuelve la lista de órdenes.
*/
