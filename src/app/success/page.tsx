"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderModal } from "../components/OrderModal";

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
  }>;
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => setOrder(data as Order))
        .catch((error) => console.error("Error fetching order:", error));
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-2xl font-bold">¡Gracias por tu compra!</h1>
          <p className="text-gray-600">
            Tu orden ha sido procesada exitosamente. Te enviaremos un email con
            los detalles de tu compra.
          </p>
        </div>

        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Resumen de la orden</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Orden #:</span> {order.id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total:</span>{" "}
              {new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
              }).format(order.total)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full"
            variant="outline"
          >
            Ver detalles de la orden
          </Button>
          <Button onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </div>

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={order}
        />
      </div>
    </div>
  );
}
