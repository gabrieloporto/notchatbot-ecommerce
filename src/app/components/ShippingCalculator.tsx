import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ShippingCalculatorProps {
  onShippingCostCalculated: (cost: number) => void;
}

export function ShippingCalculator({
  onShippingCostCalculated,
}: ShippingCalculatorProps) {
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateShipping = async () => {
    if (!postalCode) {
      setError("Por favor ingresa un código postal");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/shipping-costs/${postalCode}`);
      if (!response.ok) {
        throw new Error("Código postal no encontrado");
      }
      const data = await response.json();
      onShippingCostCalculated(data.price);
    } catch (err) {
      setError("Error al calcular el envío. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculá tu envío</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Ingresá tu código postal"
            value={postalCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPostalCode(e.target.value)
            }
            maxLength={8}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button
          className="w-full"
          onClick={calculateShipping}
          disabled={isLoading}
        >
          {isLoading ? "Calculando..." : "Calcular envío"}
        </Button>
      </CardContent>
    </Card>
  );
}
