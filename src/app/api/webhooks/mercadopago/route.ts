import { NextResponse } from "next/server";
import { Payment } from "mercadopago";

import { processOrderPaymentAutomation } from "@/lib/order-automation";
import { mercadopago } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: string;
      data?: {
        id?: string | number;
      };
    };

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
    const paymentData = (await payment.get({
      id: paymentId,
    })) as {
      external_reference?: string | null;
      status?: string | null;
    };

    if (!paymentData.external_reference) {
      console.error("Payment has no external_reference:", paymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const orderId = parseInt(paymentData.external_reference, 10);
    if (isNaN(orderId)) {
      console.error("Invalid external_reference:", paymentData.external_reference);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = request.headers.get("origin") ?? `${protocol}://${host}`;

    const result = await processOrderPaymentAutomation({
      orderId,
      paymentId: String(paymentId),
      paymentStatus: paymentData.status ?? null,
      paymentSource: "mercadopago_webhook",
      paymentPayload: paymentData,
      baseUrl,
    });

    console.log(
      `Webhook: Order #${orderId} updated by automation bot — payment ${paymentId} status: ${paymentData.status}, outcome: ${result.outcome}`,
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Siempre retornar 200 para que MP no reintente infinitamente
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
