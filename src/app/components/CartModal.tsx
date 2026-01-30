"use client";

import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect, useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import Link from "next/link";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShippingMethod = "delivery" | "pickup" | null;

// Constants
const FREE_SHIPPING_THRESHOLD = 100000;
const SHIPPING_API_ENDPOINT = "/api/shipping-costs";

// Memoized Cart Item Component
const CartItem = memo(function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b pb-4 transition-opacity duration-200">
      <Image
        src={item.product.image}
        alt={item.product.name}
        width={64}
        height={64}
        className="h-16 w-16 rounded-md object-cover transition-transform duration-200 hover:scale-105"
        loading="lazy"
      />
      <div className="flex-1">
        <h3 className="line-clamp-2 text-sm font-medium">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">
          {formatPrice(item.product.price)} x {item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          className="cursor-pointer transition-colors hover:bg-gray-100"
          aria-label="Reducir cantidad"
        >
          -
        </Button>
        <span className="w-6 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          className="cursor-pointer transition-colors hover:bg-gray-100 disabled:opacity-50"
          aria-label="Aumentar cantidad"
          disabled={item.quantity >= item.product.stock}
        >
          +
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.product.id)}
          className="cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar producto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export const CartModal = memo(function CartModal({
  isOpen,
  onClose,
}: CartModalProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotal,
    shippingMethod,
    setShippingMethod,
    postalCode,
    setPostalCode,
    shippingPrice,
    setShippingPrice,
  } = useCart();

  const [isCalculating, setIsCalculating] = useState(false);
  const [showPostalCodeInput, setShowPostalCodeInput] = useState(false);

  // Memoized calculations
  const subtotal = getTotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total =
    Number(subtotal) +
    (isFreeShipping || shippingMethod === "pickup" ? 0 : Number(shippingPrice));

  // Memoized handlers
  const handleCalculateShipping = useCallback(async () => {
    if (!postalCode) return;

    setIsCalculating(true);
    try {
      const response = await fetch(`${SHIPPING_API_ENDPOINT}/${postalCode}`);
      if (!response.ok) {
        throw new Error("Código postal no encontrado");
      }
      const data = (await response.json()) as { price: number };
      setShippingPrice(data.price);
      setShippingMethod("delivery");
      setShowPostalCodeInput(false);
    } catch (error) {
      console.error("Error al calcular el envío:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [postalCode, setShippingPrice, setShippingMethod]);

  const handleChangePostalCode = useCallback(() => {
    setShowPostalCodeInput(true);
    setShippingMethod(null);
    setShippingPrice(0);
  }, [setShippingMethod, setShippingPrice]);

  // Efecto para inicializar el método de envío
  useEffect(() => {
    if (postalCode && shippingPrice > 0 && !shippingMethod) {
      setShippingMethod("delivery");
    }
  }, [postalCode, shippingPrice, shippingMethod, setShippingMethod]);

  // Effects
  useEffect(() => {
    if (postalCode && shippingPrice > 0) {
      setShowPostalCodeInput(false);
    } else if (postalCode) {
      setShowPostalCodeInput(true);
    }
  }, [postalCode, shippingPrice]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md translate-x-0 bg-white shadow-xl transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 id="cart-title" className="text-lg font-semibold">
              Tu Carrito
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="cursor-pointer transition-colors hover:bg-gray-100"
              aria-label="Cerrar carrito"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500">Tu carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Fixed Shipping Section */}
          {items.length > 0 && (
            <div className="border-t p-4">
              <h3 className="mb-4 font-medium">Método de envío</h3>

              {showPostalCodeInput ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Código postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="focus:ring-primary flex-1 transition-colors focus:ring-2"
                    aria-label="Código postal"
                  />
                  <Button
                    onClick={handleCalculateShipping}
                    disabled={!postalCode || isCalculating}
                    className="hover:bg-primary/90 cursor-pointer transition-colors"
                  >
                    {isCalculating ? "Calculando..." : "Calcular"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Entregas para el CP: {postalCode}
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleChangePostalCode}
                    className="hover:bg-primary/90 cursor-pointer transition-colors"
                  >
                    Cambiar CP
                  </Button>
                </div>
              )}

              {(shippingPrice > 0 || shippingMethod) && (
                <RadioGroup
                  value={shippingMethod ?? ""}
                  onValueChange={(value) =>
                    setShippingMethod(value as ShippingMethod)
                  }
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="delivery"
                      id="delivery"
                      className="data-[state=checked]:border-primary border-2 border-gray-400 transition-colors"
                    />
                    <Label htmlFor="delivery" className="flex-1">
                      Envío a domicilio
                      {!isFreeShipping && shippingPrice > 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                          {formatPrice(shippingPrice)}
                        </span>
                      )}
                      {isFreeShipping && (
                        <span className="ml-2 text-sm text-green-600">
                          ¡Gratis!
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pickup"
                      id="pickup"
                      className="data-[state=checked]:border-primary border-2 border-gray-400 transition-colors"
                    />
                    <Label htmlFor="pickup">Retiro en tienda</Label>
                  </div>
                </RadioGroup>
              )}

              {/* Total */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {!isFreeShipping && shippingMethod === "delivery" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Envío</span>
                    <span>{formatPrice(shippingPrice)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/checkout">Proceder al pago</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
