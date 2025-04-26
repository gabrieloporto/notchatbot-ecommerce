"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { CartModal } from "./CartModal";
import { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import Image from "next/image";

// Types
interface HeaderProps {
  onCartOpen?: () => void;
}

// Constants
const CART_ICON_SIZE = 20;
const BADGE_SIZE = 20;

// Memoized Cart Badge Component
const CartBadge = memo(function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
      aria-label={`${count} items en el carrito`}
    >
      {count}
    </span>
  );
});

export const Header = memo(function Header({ onCartOpen }: HeaderProps) {
  const { items, shouldOpenCart, setShouldOpenCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const initialItemsCount = useRef(items.length);

  // Memoized calculations
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  // Memoized handlers
  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
    setShouldOpenCart(false);
    onCartOpen?.();
  }, [onCartOpen, setShouldOpenCart]);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
    setShouldOpenCart(false);
  }, [setShouldOpenCart]);

  // Effects
  useEffect(() => {
    if (shouldOpenCart) {
      setIsCartOpen(true);
    }
  }, [shouldOpenCart]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        role="banner"
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="focus:ring-primary flex items-center space-x-2 rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-none"
            aria-label="Ir a la página principal"
          >
            <span className="text-xl font-bold tracking-tight">
              NotChatbot <span className="text-primary">Store</span>
            </span>
          </Link>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 cursor-pointer transition-colors hover:bg-gray-100"
              onClick={handleCartOpen}
              aria-label="Abrir carrito"
              aria-expanded={isCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              <CartBadge count={totalItems} />
            </Button>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
});
