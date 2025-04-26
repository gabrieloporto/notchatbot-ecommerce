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
      <div className="flex flex-col-reverse gap-8 md:flex-row">
        <div className="md:w-1/2">
          <CheckoutForm />
        </div>
        <div className="md:w-1/2">
          <OrderSummary />
        </div>
      </div>
    </main>
  );
}
