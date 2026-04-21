"use client";

import { Button } from "@/components/ui/button";
import {
  getOrderStatusLabel,
  getOrderStatusStyle,
  isOrderAutomated,
} from "@/lib/order-status";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { OrderModal } from "./OrderModal";

interface AutomationEvent {
  id: number;
  eventType: string;
  status: string;
  message: string;
  payload?: unknown;
  createdAt: string;
}

interface Order {
  id: number | string;
  customerName?: string;
  contactEmail?: string;
  customerEmail?: string;
  total: number | string;
  status?: string;
  createdAt?: string;
  shippingMethod?: 'delivery' | 'pickup';
  automationEvents?: AutomationEvent[];
  automationSummary?: {
    totalEvents: number;
    lastEvent: AutomationEvent | null;
    automated: boolean;
  };
  items: Array<{
    id?: number;
    name?: string;
    price?: number;
    quantity?: number;
    product?: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
  }>;
}

interface SuccessPageContentProps {
  order?: Order;
}

export default function SuccessPageContent({ order: propOrder }: SuccessPageContentProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  const paymentStatus = searchParams?.get("status") ?? searchParams?.get("collection_status");
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationFeedback, setSimulationFeedback] = useState<string | null>(null);
  const { clearCart } = useCart(); // Usa el hook

  const loadOrder = useCallback(async (targetOrderId: string) => {
    const response = await fetch(`/api/orders/${targetOrderId}`);

    if (!response.ok) {
      throw new Error("Error fetching order");
    }

    const data = (await response.json()) as Order;
    setFetchedOrder(data);
  }, []);

  useEffect(() => {
    if (orderId && !propOrder) {
      loadOrder(orderId)
        .catch((error) => console.error("Error fetching order:", error));
    }
  }, [loadOrder, orderId, propOrder]);

  // Limpiar carrito cuando el pago fue aprobado
  useEffect(() => {
    if (paymentStatus === "approved") {
      clearCart();
    }
  }, [paymentStatus, clearCart]);

  const order = propOrder ?? fetchedOrder;

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Cargando...</h1>
        </div>
      </div>
    );
  }

  // Determinar título y mensaje según estado del pago
  const getStatusInfo = () => {
    switch (paymentStatus) {
      case "approved":
        return {
          title: "¡Pago aprobado!",
          message: "Tu pago fue procesado exitosamente. Te enviaremos un email con los detalles de tu compra.",
          color: "text-green-600",
          badge: "✅ Aprobado",
        };
      case "pending":
      case "in_process":
        return {
          title: "Pago pendiente",
          message: "Tu pago está siendo procesado. Te notificaremos cuando sea aprobado.",
          color: "text-yellow-600",
          badge: "⏳ Pendiente",
        };
      case "rejected":
      case "failure":
        return {
          title: "Pago rechazado",
          message: "Tu pago fue rechazado. Por favor intenta con otro medio de pago.",
          color: "text-red-600",
          badge: "❌ Rechazado",
        };
      default:
        return {
          title: "¡Compra Exitosa!",
          message: "Tu orden ha sido procesada exitosamente. Te enviaremos un email con los detalles de tu compra.",
          color: "text-primary",
          badge: null,
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Helper to get item details from both formats
  const getItemName = (item: Order["items"][0]) => item.name ?? item.product?.name ?? "";
  const getItemPrice = (item: Order["items"][0]) => item.price ?? item.product?.price ?? 0;
  const getItemQuantity = (item: Order["items"][0]) => item.quantity ?? 0;
  const modalOrder =
    fetchedOrder?.createdAt && fetchedOrder.customerName
      ? {
          id: Number(fetchedOrder.id),
          customerName: fetchedOrder.customerName,
          total: fetchedOrder.total,
          status: fetchedOrder.status ?? "pending",
          createdAt: fetchedOrder.createdAt,
          automationEvents: fetchedOrder.automationEvents,
          items: fetchedOrder.items
            .filter(
              (item): item is {
                quantity: number;
                product: {
                  id: number;
                  name: string;
                  price: number;
                  image: string;
                };
              } => Boolean(item.product?.id && typeof item.quantity === "number"),
            )
            .map((item) => ({
              quantity: item.quantity,
              product: item.product,
            })),
        }
      : null;
  const currentStatusLabel = getOrderStatusLabel(order.status);
  const currentStatusStyle = getOrderStatusStyle(order.status);
  const canSimulateAutomation =
    process.env.NODE_ENV !== "production" &&
    typeof order.id === "number" &&
    (order.status === "pending" || order.status === "paid");

  const handleSimulateAutomation = async () => {
    if (typeof order.id !== "number") {
      return;
    }

    setIsSimulating(true);
    setSimulationFeedback(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/simulate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "approved",
        }),
      });

      if (!response.ok) {
        throw new Error("Error running automation bot");
      }

      if (orderId) {
        await loadOrder(orderId);
      }

      clearCart();
      setSimulationFeedback("El bot proceso la orden y actualizo el estado automaticamente.");
    } catch (error) {
      console.error("Error simulating automation:", error);
      setSimulationFeedback("No se pudo ejecutar la automatizacion de demo.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className={`mb-4 text-3xl font-bold ${statusInfo.color}`}>{statusInfo.title}</h1>
          <p className="text-gray-600">{statusInfo.message}</p>
          {statusInfo.badge && (
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-4 py-1 text-sm font-medium">
              {statusInfo.badge}
            </span>
          )}
        </div>

        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Resumen de la orden</h2>
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">Orden #:</span> {order.id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Estado actual:</span>{" "}
              <span className={currentStatusStyle}>{currentStatusLabel}</span>
            </p>
            {(order.contactEmail ?? order.customerEmail) && (
              <p className="text-sm">
                <span className="font-medium">Email:</span>{" "}
                {order.contactEmail ?? order.customerEmail}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Total:</span>{" "}
              {formatPrice(order.total)}
            </p>
            {order.shippingMethod && (
              <p className="text-sm">
                <span className="font-medium">Método de entrega:</span>{" "}
                {order.shippingMethod === 'delivery' ? 'Envío a domicilio' : 'Retiro en local'}
              </p>
            )}
            {isOrderAutomated(order.status) && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                El bot de fulfillment ya proceso esta orden automaticamente.
              </p>
            )}
            {order.status === "manual_review" && (
              <p className="rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700">
                La automatizacion detecto una excepcion y derivo la orden a revision manual.
              </p>
            )}
          </div>
        </div>

        {canSimulateAutomation && (
          <div className="mb-8 rounded-lg border border-dashed p-6">
            <h2 className="mb-3 text-xl font-semibold">Demo del bot</h2>
            <p className="mb-4 text-sm text-gray-600">
              Ejecuta la automatizacion completa sin depender del webhook real de Mercado Pago.
            </p>
            <Button
              onClick={handleSimulateAutomation}
              disabled={isSimulating}
              className="w-full"
              variant="secondary"
            >
              {isSimulating ? "Ejecutando bot..." : "Simular pago aprobado y ejecutar bot"}
            </Button>
            {simulationFeedback && (
              <p className="mt-3 text-sm text-gray-600">{simulationFeedback}</p>
            )}
          </div>
        )}

        {order.items && order.items.length > 0 && (
          <div className="mb-8 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex justify-between border-b pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{getItemName(item)}</p>
                    <p className="text-sm text-gray-500">x{getItemQuantity(item)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(getItemPrice(item))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!order.automationEvents?.length && (
          <div className="mb-8 rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trazabilidad del bot</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {order.automationEvents.length} eventos
              </span>
            </div>
            <div className="space-y-3">
              {order.automationEvents.map((event) => (
                <div key={event.id} className="rounded-md border bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{event.message}</p>
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {event.eventType} · {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            asChild
            className="w-full"
          >
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                clearCart();
                router.push("/");
              }}
            >
              Seguir comprando
            </Link>
          </Button>
          {!propOrder && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              Ver detalles completos
            </Button>
          )}
        </div>

        {!propOrder && modalOrder && (
          <OrderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={modalOrder}
          />
        )}
      </div>
    </div>
  );
}
