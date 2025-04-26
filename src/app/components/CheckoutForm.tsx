"use client";

import { useCart } from "@/app/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useCallback, useMemo, memo } from "react";
import { formatPrice } from "@/utils/formatPrice";

// Types
interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
}

// Constants
const FREE_SHIPPING_THRESHOLD = 100000;
const SHIPPING_API_ENDPOINT = "/api/shipping-costs";

// Memoized Input Component
const FormInput = memo(function FormInput({
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: {
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <Input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="focus:border-primary focus:ring-primary border-gray-400"
      aria-label={placeholder}
    />
  );
});

export const CheckoutForm = memo(function CheckoutForm() {
  const {
    shippingMethod,
    setShippingMethod,
    postalCode,
    setPostalCode,
    setShippingPrice,
    shippingPrice,
    getTotal,
  } = useCart();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [showPostalCodeInput, setShowPostalCodeInput] = useState(false);

  // Memoized calculations
  const subtotal = useMemo(() => getTotal(), [getTotal]);
  const isFreeShipping = useMemo(
    () => subtotal >= FREE_SHIPPING_THRESHOLD,
    [subtotal],
  );

  // Memoized handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const calculateShipping = useCallback(async () => {
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

  return (
    <div className="space-y-8">
      {/* Datos de Contacto */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Datos de Contacto</h2>
        <div className="space-y-2">
          <FormInput
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
        </div>
      </section>

      {/* Métodos de Envío */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Métodos de Envío</h2>
        <RadioGroup
          value={shippingMethod ?? ""}
          onValueChange={(value) =>
            setShippingMethod(value as "delivery" | "pickup" | null)
          }
          className="space-y-2"
          aria-label="Método de envío"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="delivery"
              id="delivery"
              className="data-[state=checked]:border-primary border-2 border-gray-400 transition-colors"
            />
            <Label htmlFor="delivery" className="flex items-center gap-2">
              Envío a domicilio
              {shippingPrice > 0 && !isFreeShipping ? (
                <span className="text-sm text-gray-500">
                  {formatPrice(shippingPrice)}
                </span>
              ) : (
                <span className="text-sm text-green-600">Gratis!</span>
              )}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="pickup"
              id="pickup"
              className="data-[state=checked]:border-primary border-2 border-gray-400 transition-colors"
            />
            <Label htmlFor="pickup" className="flex items-center gap-2">
              Retiro por el local
              <span className="text-sm text-green-600">Gratis</span>
            </Label>
          </div>
        </RadioGroup>
      </section>

      {/* Datos del Cliente */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Datos del Cliente</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Nombre"
            required
          />
          <FormInput
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Apellido"
            required
          />
        </div>
        <FormInput
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Teléfono"
          required
        />

        {/* Código Postal */}
        <div className="space-y-2">
          {showPostalCodeInput ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Código postal"
                className="focus:border-primary focus:ring-primary flex-1 border-gray-400"
                aria-label="Código postal"
              />
              <Button
                onClick={calculateShipping}
                disabled={!postalCode || isCalculating}
                className="bg-primary hover:bg-primary/90 text-white transition-colors"
              >
                {isCalculating ? "Calculando..." : "Calcular"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md border border-gray-400 p-2">
              <span className="text-sm text-gray-500">
                Código Postal: <b className="text-primary">{postalCode}</b>
              </span>
              <button
                onClick={handleChangePostalCode}
                className="text-primary hover:text-primary/80 cursor-pointer text-sm font-bold transition-colors"
              >
                Cambiar CP
              </button>
            </div>
          )}
        </div>

        <FormInput
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Dirección"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Ciudad"
            required
          />
          <FormInput
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            placeholder="Provincia"
            required
          />
        </div>
      </section>

      {/* Botón de pago */}
      <div className="mt-8">
        <Button
          className="bg-primary hover:bg-primary/90 w-full text-white transition-colors"
          size="lg"
          aria-label="Proceder al pago"
        >
          Pagar ahora
        </Button>
      </div>
    </div>
  );
});
