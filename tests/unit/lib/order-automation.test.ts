import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {},
}));

vi.mock("@/lib/automation-notifier", () => ({
  sendAutomationNotification: vi.fn(),
}));

import {
  isAlreadyAutomated,
  mapPaymentStatusToOrderStatus,
  processOrderPaymentAutomation,
} from "@/lib/order-automation";
import { automationEvents, orders, products } from "@/server/db/schema";

interface MockOrderState {
  id: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string | null;
  shippingMethod: string;
  shippingPrice: string;
  subtotal: string;
  total: string;
  status: string;
  paymentId: string | null;
  preferenceId: string | null;
  paymentStatus: string | null;
  createdAt: Date;
  items: unknown;
}

interface MockProductState {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  category: string;
  stock: number;
}

function createOrderState(overrides: Partial<MockOrderState> = {}): MockOrderState {
  return {
    id: 101,
    customerEmail: "demo@example.com",
    customerName: "Demo User",
    customerPhone: "+5491112345678",
    shippingAddress: "Calle 123",
    shippingCity: "Buenos Aires",
    shippingProvince: "CABA",
    shippingPostalCode: "1001",
    shippingMethod: "delivery",
    shippingPrice: "1500",
    subtotal: "15000",
    total: "16500",
    status: "pending",
    paymentId: null,
    preferenceId: null,
    paymentStatus: null,
    createdAt: new Date("2026-04-21T10:00:00.000Z"),
    items: [
      {
        quantity: 2,
        product: {
          id: 1,
          name: "Zapatillas Running Pro",
        },
      },
    ],
    ...overrides,
  };
}

function createProductState(overrides: Partial<MockProductState> = {}): MockProductState {
  return {
    id: 1,
    name: "Zapatillas Running Pro",
    description: "Producto de prueba",
    price: "15000",
    image: "/product-1.jpg",
    category: "Calzado",
    stock: 5,
    ...overrides,
  };
}

function createMockDatabase(orderState: MockOrderState, productState: MockProductState[]) {
  const state = {
    order: structuredClone(orderState),
    products: structuredClone(productState),
    events: [] as Array<{
      id: number;
      orderId: number;
      eventType: string;
      status: string;
      message: string;
      payload?: unknown;
      createdAt: Date;
    }>,
  };

  const normalizedItems = (
    Array.isArray(state.order.items) ? state.order.items : []
  ) as Array<{ quantity: number; product: { id: number } }>;

  let productUpdateIndex = 0;

  const createUpdateBuilder = (table: unknown) => ({
    set: (values: Record<string, unknown>) => ({
      where: () => {
        if (table === orders) {
          state.order = {
            ...state.order,
            ...values,
          };

          return Promise.resolve([state.order]);
        }

        if (table === products) {
          return {
            returning: async () => {
              const nextItem = normalizedItems[productUpdateIndex];

              if (!nextItem) {
                return [];
              }

              const matchingProduct = state.products.find(
                (product) => product.id === nextItem.product.id,
              );

              productUpdateIndex += 1;

              if (!matchingProduct || matchingProduct.stock < nextItem.quantity) {
                return [];
              }

              matchingProduct.stock -= nextItem.quantity;
              return [{ id: matchingProduct.id }];
            },
          };
        }

        return Promise.resolve([]);
      },
    }),
  });

  const insertHandler = (table: unknown) => ({
    values: async (value: Record<string, unknown>) => {
      if (table === automationEvents) {
        state.events.push({
          id: state.events.length + 1,
          orderId: value.orderId as number,
          eventType: value.eventType as string,
          status: value.status as string,
          message: value.message as string,
          payload: value.payload,
          createdAt: new Date(),
        });
      }

      return [];
    },
  });

  const mockDb = {
    select: () => ({
      from: (table: unknown) => ({
        where: () => {
          if (table === orders) {
            return {
              limit: async () => [state.order],
            };
          }

          if (table === products) {
            return Promise.resolve(state.products);
          }

          return Promise.resolve([]);
        },
      }),
    }),
    update: (table: unknown) => createUpdateBuilder(table),
    insert: (table: unknown) => insertHandler(table),
    transaction: async (callback: (tx: unknown) => Promise<void>) => {
      productUpdateIndex = 0;
      await callback({
        update: (table: unknown) => createUpdateBuilder(table),
        insert: (table: unknown) => insertHandler(table),
      });
    },
  };

  return {
    mockDb,
    state,
  };
}

describe("order automation bot", () => {
  it("maps payment states to order states", () => {
    expect(mapPaymentStatusToOrderStatus("approved")).toBe("paid");
    expect(mapPaymentStatusToOrderStatus("pending")).toBe("pending");
    expect(mapPaymentStatusToOrderStatus("cancelled")).toBe("cancelled");
  });

  it("detects already automated orders", () => {
    expect(isAlreadyAutomated("ready_for_fulfillment")).toBe(true);
    expect(isAlreadyAutomated("manual_review")).toBe(true);
    expect(isAlreadyAutomated("pending")).toBe(false);
  });

  it("marks a paid order as ready for fulfillment and discounts stock", async () => {
    const { mockDb, state } = createMockDatabase(createOrderState(), [createProductState()]);
    const notify = vi.fn().mockResolvedValue({
      delivered: true,
      target: "http://localhost:3000/api/automation-demo-events",
      mode: "demo",
      responseStatus: 200,
    });

    const result = await processOrderPaymentAutomation(
      {
        orderId: 101,
        paymentId: "pay-101",
        paymentStatus: "approved",
        paymentSource: "simulation",
        baseUrl: "http://localhost:3000",
      },
      {
        database: mockDb as never,
        notify,
      },
    );

    expect(result.outcome).toBe("ready_for_fulfillment");
    expect(state.order.status).toBe("ready_for_fulfillment");
    expect(state.order.paymentStatus).toBe("approved");
    expect(state.products[0]?.stock).toBe(3);
    expect(notify).toHaveBeenCalledOnce();
    expect(state.events.some((event) => event.eventType === "automation.fulfillment_ready")).toBe(true);
  });

  it("sends the order to manual review when stock is insufficient", async () => {
    const { mockDb, state } = createMockDatabase(createOrderState(), [
      createProductState({ stock: 1 }),
    ]);
    const notify = vi.fn().mockResolvedValue({
      delivered: true,
      target: "http://localhost:3000/api/automation-demo-events",
      mode: "demo",
      responseStatus: 200,
    });

    const result = await processOrderPaymentAutomation(
      {
        orderId: 101,
        paymentId: "pay-102",
        paymentStatus: "approved",
        paymentSource: "simulation",
        baseUrl: "http://localhost:3000",
      },
      {
        database: mockDb as never,
        notify,
      },
    );

    expect(result.outcome).toBe("manual_review");
    expect(state.order.status).toBe("manual_review");
    expect(state.products[0]?.stock).toBe(1);
    expect(notify).toHaveBeenCalledOnce();
    expect(state.events.some((event) => event.eventType === "automation.manual_review")).toBe(true);
  });

  it("skips duplicate automation runs for the same approved payment", async () => {
    const { mockDb, state } = createMockDatabase(
      createOrderState({
        status: "ready_for_fulfillment",
        paymentId: "pay-103",
        paymentStatus: "approved",
      }),
      [createProductState({ stock: 3 })],
    );
    const notify = vi.fn();

    const result = await processOrderPaymentAutomation(
      {
        orderId: 101,
        paymentId: "pay-103",
        paymentStatus: "approved",
        paymentSource: "mercadopago_webhook",
      },
      {
        database: mockDb as never,
        notify,
      },
    );

    expect(result.outcome).toBe("already_processed");
    expect(state.order.status).toBe("ready_for_fulfillment");
    expect(notify).not.toHaveBeenCalled();
    expect(state.events.some((event) => event.eventType === "automation.idempotent_skip")).toBe(true);
  });
});
