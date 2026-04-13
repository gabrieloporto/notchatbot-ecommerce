import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Payment } from "mercadopago";
import { mercadopago } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data } = body;

    // Solo procesamos notificaciones de tipo "payment"
    if (type !== "payment") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Consultar el pago en la API de MercadoPago
    const payment = new Payment(mercadopago);
    const paymentData = await payment.get({ id: paymentId });

    if (!paymentData.external_reference) {
      console.error("Payment has no external_reference:", paymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const orderId = parseInt(paymentData.external_reference, 10);
    if (isNaN(orderId)) {
      console.error("Invalid external_reference:", paymentData.external_reference);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Mapear el status de MP al status de nuestra orden
    let orderStatus = "pending";
    switch (paymentData.status) {
      case "approved":
        orderStatus = "paid";
        break;
      case "pending":
      case "in_process":
      case "authorized":
        orderStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
      case "refunded":
      case "charged_back":
        orderStatus = "cancelled";
        break;
    }

    // Actualizar la orden en la base de datos
    await db
      .update(orders)
      .set({
        paymentId: String(paymentId),
        paymentStatus: paymentData.status ?? null,
        status: orderStatus,
      })
      .where(eq(orders.id, orderId));

    console.log(
      `Webhook: Order #${orderId} updated — payment ${paymentId} status: ${paymentData.status}`,
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Siempre retornar 200 para que MP no reintente infinitamente
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
