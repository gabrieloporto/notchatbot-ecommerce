"use client";

import { useCart } from "@/app/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useCallback, useMemo, memo } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod Schema
const formSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios",
    ),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El apellido solo puede contener letras y espacios",
    ),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(15, "El teléfono no puede tener más de 15 caracteres")
    .regex(
      /^\+?[0-9]+$/,
      "El teléfono solo puede contener números y el signo + al inicio",
    ),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(100, "La dirección no puede tener más de 100 caracteres"),
  city: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "La ciudad solo puede contener letras y espacios",
    ),
  province: z
    .string()
    .min(2, "La provincia debe tener al menos 2 caracteres")
    .max(50, "La provincia no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "La provincia solo puede contener letras y espacios",
    ),
  postalCode: z
    .string()
    .regex(/^\d{4}$/, "El código postal debe tener exactamente 4 dígitos")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return num >= 1001 && num <= 9431;
      },
      { message: "El código postal debe estar entre 1001 y 9431" },
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

// Constants
const FREE_SHIPPING_THRESHOLD = 100000;
const SHIPPING_API_ENDPOINT = "/api/shipping-costs";

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

  const [isCalculating, setIsCalculating] = useState(false);
  const [showPostalCodeInput, setShowPostalCodeInput] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      province: "",
    },
  });

  // Memoized calculations
  const subtotal = useMemo(() => getTotal(), [getTotal]);
  const isFreeShipping = useMemo(
    () => subtotal >= FREE_SHIPPING_THRESHOLD,
    [subtotal],
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

  const onSubmit = async (data: FormData) => {
    if (!shippingMethod) {
      form.setError("root", {
        message: "Por favor selecciona un método de envío",
      });
      return;
    }

    if (shippingMethod === "delivery" && !postalCode) {
      form.setError("root", {
        message: "Por favor ingresa un código postal válido",
      });
      return;
    }

    // Here you would typically send the order to your backend
    console.log("Form submitted:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Datos de Contacto */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Datos de Contacto</h2>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    className="focus:border-primary focus:ring-primary border-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre"
                      className="focus:border-primary focus:ring-primary border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Apellido"
                      className="focus:border-primary focus:ring-primary border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="Teléfono"
                    className="focus:border-primary focus:ring-primary border-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Código Postal */}
          <div className="space-y-2">
            {showPostalCodeInput ? (
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            value={postalCode}
                            onChange={(e) => {
                              // Solo permitir números y máximo 4 dígitos
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);
                              setPostalCode(value);
                              field.onChange(value);
                            }}
                            placeholder="Ej: 1001"
                            className="focus:border-primary focus:ring-primary flex-1 border-gray-400"
                            aria-label="Código postal"
                          />
                        </FormControl>
                        <Button
                          onClick={calculateShipping}
                          disabled={
                            !postalCode ||
                            postalCode.length !== 4 ||
                            isCalculating
                          }
                          className="bg-primary hover:bg-primary/90 text-white transition-colors"
                        >
                          {isCalculating ? "Calculando..." : "Calcular"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Dirección"
                    className="focus:border-primary focus:ring-primary border-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ciudad"
                      className="focus:border-primary focus:ring-primary border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Provincia"
                      className="focus:border-primary focus:ring-primary border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {form.formState.errors.root && (
          <div className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 w-full text-white transition-colors"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Procesando..." : "Finalizar compra"}
        </Button>
      </form>
    </Form>
  );
});
