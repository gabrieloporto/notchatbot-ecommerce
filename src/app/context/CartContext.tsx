"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

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

type ShippingMethod = "delivery" | "pickup" | null;

interface CartState {
  items: CartItem[];
  shippingMethod: ShippingMethod;
  postalCode: string;
  shippingPrice: number;
  shouldOpenCart: boolean;
}

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotal: () => number;
  getProductQuantity: (productId: number) => number;
  setShippingMethod: (method: ShippingMethod) => void;
  setPostalCode: (code: string) => void;
  setShippingPrice: (price: number) => void;
  calculateShipping: (code: string) => Promise<void>;
  setShouldOpenCart: (shouldOpen: boolean) => void;
  clearCart: () => void;
}

// Constants
const STORAGE_KEYS = {
  CART: "cart",
  SHIPPING_METHOD: "shippingMethod",
  POSTAL_CODE: "postalCode",
  SHIPPING_PRICE: "shippingPrice",
  SHOULD_OPEN_CART: "shouldOpenCart",
} as const;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [state, setState] = useState<CartState>({
    items: [],
    shippingMethod: null,
    postalCode: "",
    shippingPrice: 0,
    shouldOpenCart: false,
  });

  // Memoized values
  const subtotal = useMemo(() => {
    return state.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [state.items]);

  // Load initial state from localStorage
  useEffect(() => {
    const loadState = () => {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        const savedShippingMethod = localStorage.getItem(
          STORAGE_KEYS.SHIPPING_METHOD,
        );
        const savedPostalCode = localStorage.getItem(STORAGE_KEYS.POSTAL_CODE);
        const savedShippingPrice = localStorage.getItem(
          STORAGE_KEYS.SHIPPING_PRICE,
        );
        const savedShouldOpenCart = localStorage.getItem(
          STORAGE_KEYS.SHOULD_OPEN_CART,
        );

        const newState: Partial<CartState> = {};

        if (savedCart) {
          newState.items = JSON.parse(savedCart) as CartItem[];
        }
        if (savedShippingMethod) {
          newState.shippingMethod = savedShippingMethod as ShippingMethod;
        }
        if (savedPostalCode) {
          newState.postalCode = savedPostalCode;
        }
        if (savedShippingPrice) {
          newState.shippingPrice = Number(savedShippingPrice);
        }
        if (savedShouldOpenCart) {
          newState.shouldOpenCart = savedShouldOpenCart === "true";
        }

        setState((prev) => ({ ...prev, ...newState }));
      } catch (error) {
        console.error("Error loading cart state:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el estado del carrito",
          variant: "destructive",
        });
      }
    };

    loadState();
  }, [toast]);

  // Save state to localStorage
  useEffect(() => {
    const saveState = () => {
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.items));
        if (state.shippingMethod) {
          localStorage.setItem(
            STORAGE_KEYS.SHIPPING_METHOD,
            state.shippingMethod,
          );
        }
        if (state.postalCode) {
          localStorage.setItem(STORAGE_KEYS.POSTAL_CODE, state.postalCode);
        }
        if (state.shippingPrice > 0) {
          localStorage.setItem(
            STORAGE_KEYS.SHIPPING_PRICE,
            state.shippingPrice.toString(),
          );
        }
        localStorage.setItem(
          STORAGE_KEYS.SHOULD_OPEN_CART,
          state.shouldOpenCart.toString(),
        );
      } catch (error) {
        console.error("Error saving cart state:", error);
      }
    };

    saveState();
  }, [state]);

  // Memoized callbacks
  const addToCart = useCallback(
    (product: Product) => {
      setState((prev) => {
        const existingItem = prev.items.find(
          (item) => item.product.id === product.id,
        );
        
        // Verificación de stock para nuevo item o incremento
        const currentQty = existingItem ? existingItem.quantity : 0;
        
        if (currentQty + 1 > product.stock) {
          return prev; // No modificar estado si no hay stock
        }

        const newItems = existingItem
          ? prev.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...prev.items, { product, quantity: 1 }];

        return { ...prev, items: newItems, shouldOpenCart: true };
      });
    },
    [],
  );

  const removeFromCart = useCallback((productId: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product.id !== productId),
    }));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }

      setState((prev) => {
         const itemToUpdate = prev.items.find((item) => item.product.id === productId);
         
         if (itemToUpdate && quantity > itemToUpdate.product.stock) {
             return prev; // No modificar si excede stock
         }

         return {
            ...prev,
            items: prev.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
         }
      });
    },
    [removeFromCart, toast],
  );

  const calculateShipping = useCallback(
    async (code: string) => {
      try {
        const response = await fetch(`/api/shipping-costs/${code}`);
        if (!response.ok) {
          throw new Error("Código postal no encontrado");
        }
        const data = (await response.json()) as { price: number };

        setState((prev) => ({
          ...prev,
          shippingPrice: data.price,
          shippingMethod: "delivery",
        }));
      } catch (error) {
        console.error("Error al calcular el envío:", error);
        setState((prev) => ({
          ...prev,
          shippingPrice: 0,
          shippingMethod: null,
        }));
        toast({
          title: "Error",
          description: "No se pudo calcular el costo de envío",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const clearCart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: [],
      shippingMethod: null,
      postalCode: "",
      shippingPrice: 0,
      shouldOpenCart: false,
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotal: () => subtotal + state.shippingPrice,
      getProductQuantity: (productId: number) => {
        const item = state.items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },
      setShippingMethod: (method: ShippingMethod) =>
        setState((prev) => ({ ...prev, shippingMethod: method })),
      setPostalCode: (code: string) =>
        setState((prev) => ({ ...prev, postalCode: code })),
      setShippingPrice: (price: number) =>
        setState((prev) => ({ ...prev, shippingPrice: price })),
      setShouldOpenCart: (shouldOpen: boolean) =>
        setState((prev) => ({ ...prev, shouldOpenCart: shouldOpen })),
      calculateShipping,
      clearCart,
    }),
    [
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      subtotal,
      calculateShipping,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
