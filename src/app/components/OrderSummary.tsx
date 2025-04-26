"use client";

import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import { memo, useMemo } from "react";

// Types
interface OrderItemProps {
  item: {
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
  };
}

// Constants
const FREE_SHIPPING_THRESHOLD = 100000;
const IMAGE_SIZE = 64;

// Memoized Order Item Component
const OrderItem = memo(function OrderItem({ item }: OrderItemProps) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-4">
        <Image
          src={item.product.image}
          alt={item.product.name}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          className="h-16 w-16 rounded-md object-cover"
          loading="lazy"
        />
        <div>
          <h3 className="font-medium">{item.product.name}</h3>
          <p className="text-sm text-gray-500">
            {item.quantity} x {formatPrice(item.product.price)}
          </p>
        </div>
      </div>
    </div>
  );
});

// Memoized Total Row Component
const TotalRow = memo(function TotalRow({
  label,
  value,
  isTotal = false,
}: {
  label: string;
  value: string | number;
  isTotal?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        isTotal ? "border-t pt-2" : ""
      }`}
    >
      <span className={isTotal ? "font-medium" : "text-sm text-gray-500"}>
        {label}
      </span>
      <span
        className={
          isTotal
            ? "text-lg font-semibold"
            : typeof value === "string" && value === "Gratis"
              ? "text-sm text-green-600"
              : "text-sm"
        }
      >
        {typeof value === "number" ? formatPrice(value) : value}
      </span>
    </div>
  );
});

export const OrderSummary = memo(function OrderSummary() {
  const { items, getTotal, shippingMethod, shippingPrice } = useCart();

  // Memoized calculations
  const subtotal = useMemo(() => getTotal(), [getTotal]);
  const isFreeShipping = useMemo(
    () => subtotal >= FREE_SHIPPING_THRESHOLD,
    [subtotal],
  );
  const total = useMemo(
    () =>
      Number(subtotal) +
      (isFreeShipping || shippingMethod === "pickup"
        ? 0
        : Number(shippingPrice)),
    [subtotal, shippingMethod, shippingPrice, isFreeShipping],
  );

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Resumen del pedido</h2>

      {/* Items */}
      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <OrderItem key={item.product.id} item={item} />
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2">
        <TotalRow label="Subtotal" value={subtotal} />
        {shippingMethod === "delivery" && !isFreeShipping && (
          <TotalRow label="Envío" value={shippingPrice} />
        )}
        {(isFreeShipping || shippingMethod === "pickup") && (
          <TotalRow label="Envío" value="Gratis" />
        )}
        <TotalRow label="Total" value={total} isTotal />
      </div>
    </div>
  );
});
