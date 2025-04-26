"use client";

import { useCart } from "@/app/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/utils/formatPrice";
import { useState, useCallback, memo } from "react";

// Types
interface ShippingResponse {
  price: number;
  estimatedDays: number;
}

// Constants
const SHIPPING_API_ENDPOINT = "/api/shipping-costs";
const MIN_POSTAL_CODE_LENGTH = 4;
const MAX_POSTAL_CODE_LENGTH = 8;

// Memoized Postal Code Input Component
const PostalCodeInput = memo(function PostalCodeInput({
  value,
  onChange,
  isCalculating,
  onCalculate,
}: {
  value: string;
  onChange: (value: string) => void;
  isCalculating: boolean;
  onCalculate: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Código postal"
        className="focus:border-primary focus:ring-primary flex-1 border-gray-400"
        aria-label="Código postal"
        minLength={MIN_POSTAL_CODE_LENGTH}
        maxLength={MAX_POSTAL_CODE_LENGTH}
        pattern="[0-9]*"
        inputMode="numeric"
      />
      <Button
        onClick={onCalculate}
        disabled={!value || isCalculating}
        className="bg-primary hover:bg-primary/90 text-white transition-colors"
        aria-label="Calcular costo de envío"
      >
        {isCalculating ? "Calculando..." : "Calcular"}
      </Button>
    </div>
  );
});

// Memoized Shipping Result Component
const ShippingResult = memo(function ShippingResult({
  price,
  estimatedDays,
}: {
  price: number;
  estimatedDays: number;
}) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Costo de envío</span>
        <span className="text-sm font-medium">{formatPrice(price)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Tiempo estimado</span>
        <span className="text-sm font-medium">{estimatedDays} días</span>
      </div>
    </div>
  );
});

export const ShippingCalculator = memo(function ShippingCalculator() {
  const { postalCode, setPostalCode, setShippingPrice } = useCart();
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingResult, setShippingResult] = useState<ShippingResponse | null>(
    null,
  );

  const handlePostalCodeChange = useCallback(
    (value: string) => {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, "");
      setPostalCode(numericValue);
      // Resetear el resultado cuando cambia el código postal
      setShippingResult(null);
    },
    [setPostalCode],
  );

  const calculateShipping = useCallback(async () => {
    if (!postalCode) return;

    setIsCalculating(true);
    try {
      const response = await fetch(`${SHIPPING_API_ENDPOINT}/${postalCode}`);
      if (!response.ok) {
        throw new Error("Código postal no encontrado");
      }
      const data = (await response.json()) as ShippingResponse;
      setShippingResult(data);
      setShippingPrice(data.price);
    } catch (error) {
      console.error("Error al calcular el envío:", error);
      setShippingResult(null);
      setShippingPrice(0);
    } finally {
      setIsCalculating(false);
    }
  }, [postalCode, setShippingPrice]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Calculadora de envío</h3>
      <PostalCodeInput
        value={postalCode}
        onChange={handlePostalCodeChange}
        isCalculating={isCalculating}
        onCalculate={calculateShipping}
      />
      {shippingResult && (
        <ShippingResult
          price={shippingResult.price}
          estimatedDays={shippingResult.estimatedDays}
        />
      )}
    </div>
  );
});
