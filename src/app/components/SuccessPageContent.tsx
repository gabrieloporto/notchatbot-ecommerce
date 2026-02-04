"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { OrderModal } from "./OrderModal";

interface Order {
  id: number | string;
  customerName?: string;
  contactEmail?: string;
  total: number;
  status?: string;
  createdAt?: string;
  shippingMethod?: 'delivery' | 'pickup';
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
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { clearCart } = useCart(); // Usa el hook

  useEffect(() => {
    if (orderId && !propOrder) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => setFetchedOrder(data as Order))
        .catch((error) => console.error("Error fetching order:", error));
    }
  }, [orderId, propOrder]);

  const order = propOrder || fetchedOrder;

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Cargando...</h1>
        </div>
      </div>
    );
  }

  // Helper to get item details from both formats
  const getItemName = (item: Order['items'][0]) => item.name || item.product?.name || '';
  const getItemPrice = (item: Order['items'][0]) => item.price || item.product?.price || 0;
  const getItemQuantity = (item: Order['items'][0]) => item.quantity || 0;

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">¡Compra Exitosa!</h1>
          <p className="text-gray-600">
            Tu orden ha sido procesada exitosamente. Te enviaremos un email con los detalles de tu compra.
          </p>
        </div>

        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Resumen de la orden</h2>
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">Orden #:</span> {order.id}
            </p>
            {order.contactEmail && (
              <p className="text-sm">
                <span className="font-medium">Email:</span> {order.contactEmail}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Total:</span>{" "}
              ${order.total.toLocaleString('es-AR')}
            </p>
            {order.shippingMethod && (
              <p className="text-sm">
                <span className="font-medium">Método de entrega:</span>{" "}
                {order.shippingMethod === 'delivery' ? 'Envío a domicilio' : 'Retiro en local'}
              </p>
            )}
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mb-8 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between border-b pb-4 last:border-b-0">
                  <div>
                    <p className="font-medium">{getItemName(item)}</p>
                    <p className="text-sm text-gray-500">x{getItemQuantity(item)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${getItemPrice(item).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <a href="/" className="block">
            <Button
              onClick={(e) => {
                e.preventDefault();
                clearCart();
                router.push("/");
              }}
              className="w-full"
            >
              Seguir comprando
            </Button>
          </a>
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

        {!propOrder && fetchedOrder && (
          <OrderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={fetchedOrder as any}
          />
        )}
      </div>
    </div>
  );
}
