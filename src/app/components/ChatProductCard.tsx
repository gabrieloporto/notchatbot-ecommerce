"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image?: string;
  };
}

export default function ChatProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 group"
    >
      {/* Imagen del producto */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {product.name}
        </h4>
        <p className="text-lg font-bold text-black dark:text-white mt-0.5">
          ${product.price.toLocaleString("es-AR")}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {product.stock > 0 ? (
            <span className="text-green-600 dark:text-green-400">
              {product.stock} disponibles
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">Sin stock</span>
          )}
        </p>
      </div>
    </Link>
  );
}
