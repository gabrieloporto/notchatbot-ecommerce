import { useState } from "react";

interface ShippingResponse {
  price: number;
}

const CheckoutForm = () => {
  const [shippingPrice, setShippingPrice] = useState<number>(0);

  const calculateShipping = async (postalCode: string) => {
    try {
      const response = await fetch(`/api/shipping?postalCode=${postalCode}`);
      const data = (await response.json()) as unknown;

      if (
        !data ||
        typeof data !== "object" ||
        !("price" in data) ||
        typeof (data as { price: unknown }).price !== "number"
      ) {
        throw new Error("Invalid shipping response");
      }

      const shippingData = data as ShippingResponse;
      setShippingPrice(shippingData.price);
    } catch (error: unknown) {
      console.error("Error calculating shipping:", error);
      setShippingPrice(0);
    }
  };

  return <div>{/* Form content will go here */}</div>;
};

export default CheckoutForm;
