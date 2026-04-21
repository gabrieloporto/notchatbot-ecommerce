import { env } from "@/env";

export interface AutomationNotificationPayload {
  orderId: number;
  type: "fulfillment_ready" | "manual_review" | "payment_update";
  message: string;
  customerName: string;
  customerEmail: string;
  total: number;
  shippingMethod: string;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
  }>;
  metadata?: Record<string, unknown>;
}

export interface SendAutomationNotificationOptions {
  baseUrl?: string;
  webhookUrl?: string;
}

export interface SendAutomationNotificationResult {
  delivered: boolean;
  target: string | null;
  mode: "webhook" | "demo" | "log";
  responseStatus?: number;
  error?: string;
}

function isSlackWebhook(target: string): boolean {
  return target.includes("hooks.slack.com/services/");
}

function formatShippingMethod(shippingMethod: string): string {
  return shippingMethod === "delivery" ? "Envio a domicilio" : "Retiro en local";
}

function buildSlackPayload(payload: AutomationNotificationPayload) {
  const statusEmoji =
    payload.type === "manual_review"
      ? ":warning:"
      : payload.type === "fulfillment_ready"
        ? ":package:"
        : ":moneybag:";

  const itemsText = payload.items
    .map((item) => `• ${item.name} x${item.quantity}`)
    .join("\n");

  const metadataText = Object.entries(payload.metadata ?? {})
    .map(([key, value]) => `• ${key}: ${String(value)}`)
    .join("\n");

  return {
    text: `${statusEmoji} ${payload.message}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text:
            payload.type === "manual_review"
              ? "Bot de fulfillment: excepcion detectada"
              : "Bot de fulfillment: orden automatizada",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${statusEmoji} *${payload.message}*`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Orden*\n#${payload.orderId}`,
          },
          {
            type: "mrkdwn",
            text: `*Total*\n$ ${payload.total.toLocaleString("es-AR")}`,
          },
          {
            type: "mrkdwn",
            text: `*Cliente*\n${payload.customerName}`,
          },
          {
            type: "mrkdwn",
            text: `*Entrega*\n${formatShippingMethod(payload.shippingMethod)}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Items*\n${itemsText || "Sin items"}`,
        },
      },
      ...(metadataText
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Metadata*\n${metadataText}`,
              },
            },
          ]
        : []),
    ],
  };
}

export async function sendAutomationNotification(
  payload: AutomationNotificationPayload,
  options: SendAutomationNotificationOptions = {},
): Promise<SendAutomationNotificationResult> {
  const target =
    options.webhookUrl ??
    env.AUTOMATION_WEBHOOK_URL ??
    (options.baseUrl ? `${options.baseUrl}/api/automation-demo-events` : null);

  if (!target) {
    console.log("Automation notification fallback:", payload);
    return {
      delivered: true,
      target: null,
      mode: "log",
    };
  }

  try {
    const requestBody = isSlackWebhook(target)
      ? buildSlackPayload(payload)
      : payload;

    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        delivered: false,
        target,
        mode: target.includes("/api/automation-demo-events") ? "demo" : "webhook",
        responseStatus: response.status,
        error: `Notification endpoint responded with ${response.status}`,
      };
    }

    return {
      delivered: true,
      target,
      mode: target.includes("/api/automation-demo-events") ? "demo" : "webhook",
      responseStatus: response.status,
    };
  } catch (error) {
    return {
      delivered: false,
      target,
      mode: target.includes("/api/automation-demo-events") ? "demo" : "webhook",
      error: error instanceof Error ? error.message : "Unknown notification error",
    };
  }
}
