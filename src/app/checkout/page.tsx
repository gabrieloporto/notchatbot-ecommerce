"use client";

import { CheckoutForm } from "@/app/components/CheckoutForm";
import { OrderSummary } from "@/app/components/OrderSummary";
import { useCart } from "@/app/context/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <CheckoutForm />
        </div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </main>
  );
}
