"use client";

import { Button } from "@/components/ui/button";
import { getOrderStatusLabel, getOrderStatusStyle } from "@/lib/order-status";
import { formatPrice } from "@/utils/formatPrice";
import { memo } from "react";
import Image from "next/image";

interface AutomationEvent {
  id: number;
  eventType: string;
  status: string;
  message: string;
  createdAt: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: number;
    customerName: string;
    total: number | string;
    status: string;
    createdAt: string;
    automationEvents?: AutomationEvent[];
    items: Array<{
      product: {
        id: number;
        name: string;
        price: number;
        image: string;
      };
      quantity: number;
    }>;
  };
}

export const OrderModal = memo(function OrderModal({
  isOpen,
  onClose,
  order,
}: OrderModalProps) {
  if (!isOpen) return null;

  const statusLabel = getOrderStatusLabel(order.status);
  const statusStyle = getOrderStatusStyle(order.status);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Orden #{order.id}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Cliente:</span>{" "}
                    {order.customerName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Estado:</span>{" "}
                    <span className={statusStyle}>{statusLabel}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Fecha:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total:</span>{" "}
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Productos</h3>
                {order.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 border-b pb-4"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {!!order.automationEvents?.length && (
                <div className="space-y-3">
                  <h3 className="font-medium">Eventos de automatizacion</h3>
                  {order.automationEvents.slice(-3).map((event) => (
                    <div key={event.id} className="rounded-md border bg-gray-50 p-3">
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {event.eventType} · {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button onClick={onClose} className="w-full" variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
