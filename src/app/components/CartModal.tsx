"use client";

import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShippingMethod = "delivery" | "pickup" | null;

export function CartModal({ isOpen, onClose }: CartModalProps) {
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

  // Efecto para manejar la visibilidad del input de CP al cargar el componente
  useEffect(() => {
    if (postalCode && shippingPrice > 0) {
      setShowPostalCodeInput(false);
    } else if (postalCode) {
      setShowPostalCodeInput(true);
    }
  }, [postalCode, shippingPrice]);

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= 100000;
  const total =
    Number(subtotal) +
    (isFreeShipping || shippingMethod === "pickup" ? 0 : Number(shippingPrice));

  const calculateShipping = async () => {
    if (!postalCode) return;

    setIsCalculating(true);
    try {
      const response = await fetch(`/api/shipping-costs/${postalCode}`);
      if (!response.ok) {
        throw new Error("Código postal no encontrado");
      }
      const data: { price: number } = await response.json();
      setShippingPrice(data.price);
      setShippingMethod("delivery");
      setShowPostalCodeInput(false);
    } catch (error) {
      console.error("Error al calcular el envío:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleChangePostalCode = () => {
    setShowPostalCodeInput(true);
    setShippingMethod(null);
    setShippingPrice(0);
  };

  // Cerrar el modal con la tecla Escape
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
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md translate-x-0 bg-white shadow-xl transition-transform duration-300 ease-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Tu Carrito</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="cursor-pointer transition-colors hover:bg-gray-100"
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
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 border-b pb-4 transition-opacity duration-200"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-md object-cover transition-transform duration-200 hover:scale-105"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                  />
                  <Button
                    onClick={calculateShipping}
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

              {shippingPrice > 0 && (
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
                      {!isFreeShipping && (
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
                    <Label htmlFor="pickup">
                      Retiro por el local
                      <span className="ml-2 text-sm text-green-600">
                        Gratis
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm">{formatPrice(subtotal)}</span>
                </div>
                {shippingMethod === "delivery" && !isFreeShipping && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Envío</span>
                    <span className="text-sm">
                      {formatPrice(shippingPrice)}
                    </span>
                  </div>
                )}
                {(isFreeShipping || shippingMethod === "pickup") && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Envío</span>
                    <span className="text-sm text-green-600">Gratis</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Button
                className="hover:bg-primary/90 mt-4 w-full cursor-pointer transition-colors"
                size="lg"
                asChild
              >
                <Link href="/checkout">Proceder al pago</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
