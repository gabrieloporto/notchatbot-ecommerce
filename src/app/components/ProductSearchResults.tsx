"use client";

import { memo } from "react";
import { Loader2, SearchX, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductSearchResultsProps {
  results: Product[];
  isLoading: boolean;
  error: string | null;
  query: string;
}

export const ProductSearchResults = memo(function ProductSearchResults({
  results,
  isLoading,
  error,
  query,
}: ProductSearchResultsProps) {
  const MIN_SEARCH_LENGTH = 2;

  if (query.length < MIN_SEARCH_LENGTH) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-600">Buscando productos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-red-200 bg-red-50 p-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <SearchX className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            No se encontraron productos para &quot;{query}&quot;
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
      <div className="p-2">
        <div className="px-2 py-1 text-xs font-medium text-gray-500">
          {results.length} resultado{results.length > 1 ? "s" : ""} encontrado
          {results.length > 1 ? "s" : ""}
        </div>
        {results.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-gray-50"
            prefetch={false}
          >
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-gray-900">
                {product.name}
              </h4>
              <p className="truncate text-sm text-gray-600">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});
