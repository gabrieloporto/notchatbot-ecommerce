"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { CartModal } from "./CartModal";
import { useState, useEffect } from "react";

export function Header() {
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Abrir el carrito cuando se agrega un producto
  useEffect(() => {
    if (items.length > 0) {
      setIsCartOpen(true);
    }
  }, [items.length]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">
              NotChatbot <span className="text-primary">Store</span>
            </span>
          </Link>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
