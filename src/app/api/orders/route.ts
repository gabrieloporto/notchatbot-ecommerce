import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Preference } from "mercadopago";
import { mercadopago } from "@/lib/mercadopago";

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

// POST /api/orders - Crea una nueva orden y preferencia de MercadoPago
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    // Validación básica
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Inserta la orden en la base de datos
    const [order] = await db
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
        shippingPrice: String(body.shippingPrice),
        subtotal: String(body.subtotal),
        total: String(body.total),
        items: body.items,
        status: "pending",
      })
      .returning();

    if (!order) {
      return NextResponse.json(
        { error: "Error creating order" },
        { status: 500 },
      );
    }

    // Determinar la URL base para las URLs de retorno
    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl =
      request.headers.get("origin") ?? `${protocol}://${host}`;
    const isLocalhost = host.includes("localhost");

    // Crear Preferencia de MercadoPago
    const preference = new Preference(mercadopago);

    const mpPreference = await preference.create({
      body: {
        items: body.items.map((item) => ({
          id: String(item.product.id),
          title: item.product.name,
          unit_price: Number(item.product.price),
          quantity: item.quantity,
          picture_url: item.product.image,
          currency_id: "ARS",
        })),
        payer: {
          email: body.email,
          name: body.firstName,
          surname: body.lastName,
          phone: {
            number: body.phone,
          },
          address: {
            street_name: body.address,
            zip_code: body.postalCode ?? "",
          },
        },
        // MP no acepta localhost en back_urls — solo configurar en producción
        ...(isLocalhost
          ? {}
          : {
              back_urls: {
                success: `${baseUrl}/success?orderId=${order.id}`,
                failure: `${baseUrl}/checkout?error=payment_failed`,
                pending: `${baseUrl}/success?orderId=${order.id}&status=pending`,
              },
              auto_return: "approved" as const,
            }),
        external_reference: String(order.id),
        // notification_url tampoco funciona en localhost
        ...(isLocalhost
          ? {}
          : { notification_url: `${baseUrl}/api/webhooks/mercadopago` }),
        statement_descriptor: "NEXOSHOP",
      },
    });

    // Guardar el preferenceId en la orden
    await db
      .update(orders)
      .set({ preferenceId: mpPreference.id })
      .where(eq(orders.id, order.id));

    // Devolver la orden con la URL de checkout de MP
    return NextResponse.json({
      ...order,
      preferenceId: mpPreference.id,
      init_point: mpPreference.init_point,
      sandbox_init_point: mpPreference.sandbox_init_point,
    });
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
