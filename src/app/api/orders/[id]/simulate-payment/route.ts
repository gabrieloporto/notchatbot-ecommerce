import { NextResponse } from "next/server";

import { processOrderPaymentAutomation } from "@/lib/order-automation";

interface SimulatePaymentBody {
  paymentStatus?: string;
  paymentId?: string;
}

export async function POST(
  request: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const orderId = Number(params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as SimulatePaymentBody;
    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = request.headers.get("origin") ?? `${protocol}://${host}`;

    const result = await processOrderPaymentAutomation({
      orderId,
      paymentId: body.paymentId ?? `sim-${orderId}-${Date.now()}`,
      paymentStatus: body.paymentStatus ?? "approved",
      paymentSource: "simulation",
      paymentPayload: {
        simulated: true,
        requestedStatus: body.paymentStatus ?? "approved",
      },
      baseUrl,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error simulating payment automation:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error simulating payment automation" },
      { status: 500 },
    );
  }
}
