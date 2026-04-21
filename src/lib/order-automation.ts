import { and, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { automationEvents, orders, products } from "@/server/db/schema";
import { sendAutomationNotification } from "./automation-notifier";

export type OrderAutomationStatus =
  | "pending"
  | "paid"
  | "ready_for_fulfillment"
  | "manual_review"
  | "cancelled";

export interface PaymentAutomationInput {
  orderId: number;
  paymentId: string;
  paymentStatus?: string | null;
  paymentSource: "mercadopago_webhook" | "simulation";
  paymentPayload?: unknown;
  baseUrl?: string;
  webhookUrl?: string;
}

export interface AutomationEventRecord {
  id: number;
  orderId: number;
  eventType: string;
  status: string;
  message: string;
  payload: unknown;
  createdAt: Date;
}

export interface OrderAutomationResult {
  outcome:
    | "ready_for_fulfillment"
    | "manual_review"
    | "payment_updated"
    | "already_processed";
  orderId: number;
  orderStatus: OrderAutomationStatus;
  paymentStatus: string | null;
  notificationDelivered: boolean;
  notificationMode: "webhook" | "demo" | "log" | null;
  notificationTarget: string | null;
  message: string;
}

type OrderRecord = typeof orders.$inferSelect;
type ProductRecord = typeof products.$inferSelect;

interface NormalizedOrderItem {
  productId: number;
  name: string;
  quantity: number;
}

function normalizeOrderItems(items: unknown): NormalizedOrderItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const rawItem = item as {
        quantity?: unknown;
        name?: unknown;
        product?: {
          id?: unknown;
          name?: unknown;
        };
      };

      const quantity =
        typeof rawItem.quantity === "number" ? rawItem.quantity : Number(rawItem.quantity ?? 0);
      const productId =
        typeof rawItem.product?.id === "number"
          ? rawItem.product.id
          : Number(rawItem.product?.id ?? NaN);
      const name =
        typeof rawItem.name === "string"
          ? rawItem.name
          : typeof rawItem.product?.name === "string"
            ? rawItem.product.name
            : "Producto sin nombre";

      if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      return {
        productId,
        name,
        quantity,
      };
    })
    .filter((item): item is NormalizedOrderItem => item !== null);
}

function parseOrderTotal(total: string): number {
  const parsed = Number(total);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapPaymentStatusToOrderStatus(
  paymentStatus?: string | null,
): OrderAutomationStatus {
  switch (paymentStatus) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
    case "authorized":
      return "pending";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      return "pending";
  }
}

export function isAlreadyAutomated(status?: string | null): boolean {
  return status === "ready_for_fulfillment" || status === "manual_review";
}

async function recordAutomationEvent(
  database: typeof db,
  orderId: number,
  eventType: string,
  status: string,
  message: string,
  payload?: unknown,
): Promise<void> {
  await database.insert(automationEvents).values({
    orderId,
    eventType,
    status,
    message,
    payload,
  });
}

async function fetchOrder(database: typeof db, orderId: number) {
  const [order] = await database
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return order ?? null;
}

function buildNotificationMessage(order: OrderRecord, outcome: OrderAutomationResult["outcome"]) {
  if (outcome === "manual_review") {
    return `Orden #${order.id} requiere revision manual por stock insuficiente.`;
  }

  if (outcome === "ready_for_fulfillment") {
    return `Orden #${order.id} lista para preparar y despachar.`;
  }

  return `Orden #${order.id} actualizada con estado de pago ${order.paymentStatus ?? "desconocido"}.`;
}

export async function processOrderPaymentAutomation(
  input: PaymentAutomationInput,
  dependencies: {
    database?: typeof db;
    notify?: typeof sendAutomationNotification;
  } = {},
): Promise<OrderAutomationResult> {
  const database = dependencies.database ?? db;
  const notify = dependencies.notify ?? sendAutomationNotification;
  const mappedOrderStatus = mapPaymentStatusToOrderStatus(input.paymentStatus);

  const existing = await fetchOrder(database, input.orderId);

  if (!existing) {
    throw new Error(`Order ${input.orderId} not found`);
  }

  const order = existing;

  if (
    input.paymentStatus === "approved" &&
    isAlreadyAutomated(order.status) &&
    order.paymentId === input.paymentId
  ) {
    await recordAutomationEvent(
      database,
      input.orderId,
      "automation.idempotent_skip",
      "info",
      "El bot detecto que la orden ya habia sido procesada anteriormente.",
      {
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus,
        source: input.paymentSource,
      },
    );

    return {
      outcome: "already_processed",
      orderId: input.orderId,
      orderStatus: order.status as OrderAutomationStatus,
      paymentStatus: order.paymentStatus ?? null,
      notificationDelivered: false,
      notificationMode: null,
      notificationTarget: null,
      message: "Order already processed by automation",
    };
  }

  await recordAutomationEvent(
    database,
    input.orderId,
    "payment.received",
    "info",
    `Se recibio actualizacion de pago ${input.paymentStatus ?? "unknown"} desde ${input.paymentSource}.`,
    {
      paymentId: input.paymentId,
      paymentStatus: input.paymentStatus,
      source: input.paymentSource,
      payload: input.paymentPayload,
    },
  );

  if (input.paymentStatus !== "approved") {
    await database
      .update(orders)
      .set({
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus ?? null,
        status: mappedOrderStatus,
      })
      .where(eq(orders.id, input.orderId));

    await recordAutomationEvent(
      database,
      input.orderId,
      "payment.status_updated",
      mappedOrderStatus === "cancelled" ? "warning" : "info",
      `La orden fue actualizada a ${mappedOrderStatus} sin ejecutar fulfillment.`,
      {
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus,
      },
    );

    return {
      outcome: "payment_updated",
      orderId: input.orderId,
      orderStatus: mappedOrderStatus,
      paymentStatus: input.paymentStatus ?? null,
      notificationDelivered: false,
      notificationMode: null,
      notificationTarget: null,
      message: "Payment status updated without fulfillment automation",
    };
  }

  const normalizedItems = normalizeOrderItems(order.items);

  if (normalizedItems.length === 0) {
    await database
      .update(orders)
      .set({
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus ?? null,
        status: "manual_review",
      })
      .where(eq(orders.id, input.orderId));

    await recordAutomationEvent(
      database,
      input.orderId,
      "automation.manual_review",
      "warning",
      "La orden no tiene items validos para automatizar el fulfillment.",
      {
        paymentId: input.paymentId,
      },
    );

    return {
      outcome: "manual_review",
      orderId: input.orderId,
      orderStatus: "manual_review",
      paymentStatus: input.paymentStatus ?? null,
      notificationDelivered: false,
      notificationMode: null,
      notificationTarget: null,
      message: "Order requires manual review because items are invalid",
    };
  }

  const productIds = normalizedItems.map((item) => item.productId);
  const inventory = await database
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const inventoryMap = new Map<number, ProductRecord>();
  for (const product of inventory) {
    inventoryMap.set(product.id, product);
  }

  const missingOrInsufficient = normalizedItems.filter((item) => {
    const product = inventoryMap.get(item.productId);
    return !product || product.stock < item.quantity;
  });

  let outcome: OrderAutomationResult["outcome"] = "ready_for_fulfillment";
  let message = "Order processed and ready for fulfillment";

  if (missingOrInsufficient.length > 0) {
    outcome = "manual_review";
    message = "Order requires manual review because stock is insufficient";

    await database
      .update(orders)
      .set({
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus ?? null,
        status: "manual_review",
      })
      .where(eq(orders.id, input.orderId));

    await recordAutomationEvent(
      database,
      input.orderId,
      "automation.manual_review",
      "warning",
      "El bot freno el fulfillment porque detecto faltante de stock.",
      {
        missingOrInsufficient: missingOrInsufficient.map((item) => ({
          productId: item.productId,
          requestedQuantity: item.quantity,
          availableStock: inventoryMap.get(item.productId)?.stock ?? 0,
        })),
      },
    );
  } else {
    try {
      await database.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({
            paymentId: input.paymentId,
            paymentStatus: input.paymentStatus ?? null,
            status: "paid",
          })
          .where(eq(orders.id, input.orderId));

        await tx.insert(automationEvents).values({
          orderId: input.orderId,
          eventType: "automation.stock_validation",
          status: "success",
          message: "Stock validado correctamente. Iniciando reserva automatica.",
          payload: {
            items: normalizedItems,
          },
        });

        for (const item of normalizedItems) {
          const updatedRows = await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
            .returning({ id: products.id });

          if (updatedRows.length === 0) {
            throw new Error(`Insufficient stock while reserving product ${item.productId}`);
          }
        }

        await tx
          .update(orders)
          .set({
            status: "ready_for_fulfillment",
          })
          .where(eq(orders.id, input.orderId));

        await tx.insert(automationEvents).values({
          orderId: input.orderId,
          eventType: "automation.fulfillment_ready",
          status: "success",
          message: "La orden quedo lista para preparar y despachar.",
          payload: {
            reservedItems: normalizedItems,
          },
        });
      });
    } catch (error) {
      outcome = "manual_review";
      message = "Order requires manual review because stock changed during reservation";

      await database
        .update(orders)
        .set({
          paymentId: input.paymentId,
          paymentStatus: input.paymentStatus ?? null,
          status: "manual_review",
        })
        .where(eq(orders.id, input.orderId));

      await recordAutomationEvent(
        database,
        input.orderId,
        "automation.manual_review",
        "warning",
        "El bot detecto una condicion de carrera al reservar stock y derivo la orden a revision manual.",
        {
          error: error instanceof Error ? error.message : "Unknown stock reservation error",
        },
      );
    }
  }

  const [finalOrder] = await database
    .select()
    .from(orders)
    .where(eq(orders.id, input.orderId))
    .limit(1);

  if (!finalOrder) {
    throw new Error(`Order ${input.orderId} disappeared after automation`);
  }

  const notificationPayload = {
    orderId: finalOrder.id,
    type:
      outcome === "manual_review"
        ? ("manual_review" as const)
        : ("fulfillment_ready" as const),
    message: buildNotificationMessage(finalOrder, outcome),
    customerName: finalOrder.customerName,
    customerEmail: finalOrder.customerEmail,
    total: parseOrderTotal(finalOrder.total),
    shippingMethod: finalOrder.shippingMethod,
    items: normalizedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
    })),
    metadata: {
      paymentId: input.paymentId,
      paymentStatus: input.paymentStatus ?? null,
      source: input.paymentSource,
      orderStatus: finalOrder.status,
    },
  };

  const notification = await notify(notificationPayload, {
    baseUrl: input.baseUrl,
    webhookUrl: input.webhookUrl,
  });

  await recordAutomationEvent(
    database,
    input.orderId,
    notification.delivered ? "notification.sent" : "notification.failed",
    notification.delivered ? "success" : "warning",
    notification.delivered
      ? "Se envio la notificacion operativa del bot."
      : "La notificacion operativa fallo, pero la automatizacion principal siguio su curso.",
    {
      mode: notification.mode,
      target: notification.target,
      responseStatus: notification.responseStatus,
      error: notification.error,
    },
  );

  return {
    outcome,
    orderId: input.orderId,
    orderStatus: finalOrder.status as OrderAutomationStatus,
    paymentStatus: finalOrder.paymentStatus ?? null,
    notificationDelivered: notification.delivered,
    notificationMode: notification.mode,
    notificationTarget: notification.target,
    message,
  };
}
