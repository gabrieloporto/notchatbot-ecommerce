"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { useState, useCallback, memo } from "react";
import Image from "next/image";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

// Constants
const ADD_TO_CART_TIMEOUT = 2000;

export const ProductCard = memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const hasStock = product.stock > 0;

  const handleAddToCart = useCallback(() => {
    if (!hasStock) return;
    
    addToCart(product);
    setIsAdded(true);

    if (onAddToCart) {
      onAddToCart();
    }

    // Reset the button state after timeout
    const timeoutId = setTimeout(() => {
      setIsAdded(false);
    }, ADD_TO_CART_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [addToCart, product, onAddToCart, hasStock]);

  return (
    <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          priority={false}
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            <Link
              href={`/products/${product.id}`}
              className="hover:text-primary transition-colors"
              prefetch={false}
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(product.price)}
          </p>
        </div>

        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">
          {product.description}
        </p>

        <Button
          variant={isAdded ? "outline" : "default"}
          size="lg"
          className={`w-full transition-colors ${
            isAdded
              ? "border-2 border-green-400 bg-green-50 text-green-600 hover:bg-green-50"
              : hasStock 
                ? "hover:bg-primary/90" 
                : "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
          } cursor-pointer`}
          onClick={handleAddToCart}
          disabled={isAdded || !hasStock}
          aria-label={
            !hasStock 
              ? "Sin stock" 
              : isAdded 
                ? "Producto agregado" 
                : "Agregar al carrito"
          }
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Listo
            </>
          ) : !hasStock ? (
             "Sin Stock"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Agregar al carrito
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
