"use client";

import { useToast } from "@/components/ui/use-toast";
import { createContext, useContext, useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotal: () => number;
  shippingMethod: "delivery" | "pickup" | null;
  setShippingMethod: (method: "delivery" | "pickup" | null) => void;
  postalCode: string;
  setPostalCode: (code: string) => void;
  shippingPrice: number;
  setShippingPrice: (price: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<
    "delivery" | "pickup" | null
  >(null);
  const [postalCode, setPostalCode] = useState<string>("");
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const { toast } = useToast();

  const calculateShipping = async (code: string) => {
    try {
      const response = await fetch(`/api/shipping-costs/${code}`);
      if (!response.ok) {
        throw new Error("Código postal no encontrado");
      }
      const data = await response.json();
      setShippingPrice(data.price);
      setShippingMethod("delivery");
    } catch (error) {
      console.error("Error al calcular el envío:", error);
      setShippingPrice(0);
      setShippingMethod(null);
    }
  };

  // Load cart data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedShippingMethod = localStorage.getItem("shippingMethod");
    const savedPostalCode = localStorage.getItem("postalCode");

    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedShippingMethod) {
      setShippingMethod(savedShippingMethod as "delivery" | "pickup" | null);
    }
    if (savedPostalCode) {
      setPostalCode(savedPostalCode);
      // Calcular el envío automáticamente si hay un código postal guardado
      calculateShipping(savedPostalCode);
    }
  }, []);

  // Save cart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Save shipping method to localStorage whenever it changes
  useEffect(() => {
    if (shippingMethod) {
      localStorage.setItem("shippingMethod", shippingMethod);
    }
  }, [shippingMethod]);

  // Save postal code to localStorage whenever it changes
  useEffect(() => {
    if (postalCode) {
      localStorage.setItem("postalCode", postalCode);
    }
  }, [postalCode]);

  const addToCart = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prevItems, { product, quantity: 1 }];
    });

    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido al carrito`,
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId),
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      if (!item?.product?.price) return total;
      return total + item.product.price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        shippingMethod,
        setShippingMethod,
        postalCode,
        setPostalCode,
        shippingPrice,
        setShippingPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
