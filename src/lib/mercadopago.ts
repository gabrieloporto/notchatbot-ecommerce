import { MercadoPagoConfig } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  console.warn(
    "⚠️ MP_ACCESS_TOKEN not set. MercadoPago payments will not work.",
  );
}

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "",
});
