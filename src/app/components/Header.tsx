"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { CartModal } from "./CartModal";
import { ProductSearch } from "./ProductSearch";
import { SearchModal } from "./SearchModal";
import { CategoryNav } from "./CategoryNav";
import { MobileNav } from "./MobileNav";
import { useState, useEffect, useCallback, memo, useMemo } from "react";

// Types
interface HeaderProps {
  onCartOpen?: () => void;
}

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

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
            className="focus:ring-primary flex items-left space-x-2 rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-none text-xl font-bold tracking-tight flex-col"
            aria-label="Ir a la página principal"
          >
            <span>
              NexoShop
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on Mobile */}
          <CategoryNav className="hidden md:flex mx-6" />

          <div className="flex items-center space-x-4">
            {/* Desktop Search - Hidden on Mobile/Tablet */}
            <div className="hidden lg:block">
              <ProductSearch />
            </div>

            {/* Mobile Search Icon - Shown on Mobile/Tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 cursor-pointer transition-colors hover:bg-gray-100"
              onClick={handleSearchOpen}
              aria-label="Abrir búsqueda"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Icon - Always visible */}
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
            <MobileNav />
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={handleCartClose} />
      <SearchModal isOpen={isSearchOpen} onClose={handleSearchClose} />
    </>
  );
});
