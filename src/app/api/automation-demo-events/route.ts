import { NextResponse } from "next/server";

import {
  addDemoAutomationEvent,
  listDemoAutomationEvents,
} from "@/lib/demo-automation-events";

export async function GET() {
  return NextResponse.json({
    events: listDemoAutomationEvents(),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: number;
      type?: string;
      message?: string;
      metadata?: unknown;
    };

    const event = addDemoAutomationEvent({
      orderId: body.orderId,
      type: body.type ?? "notification",
      source: "order-automation-bot",
      message: body.message ?? "Automation notification received",
      payload: body,
    });

    console.log("Demo automation event received:", event);

    return NextResponse.json({ received: true, event }, { status: 200 });
  } catch (error) {
    console.error("Error receiving demo automation event:", error);
    return NextResponse.json(
      { error: "Error receiving demo automation event" },
      { status: 500 },
    );
  }
}
