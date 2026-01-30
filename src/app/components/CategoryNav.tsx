"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Calzado",
  "Buzos y camperas",
  "Remeras y camisas",
  "Ropa interior",
  "Accesorios",
  "Pantalones",
];

export function CategoryNav({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex w-full space-x-6 sm:space-x-8 md:w-auto md:space-x-6">
        <Link
          href="/"
          className={cn(
            "flex-none whitespace-nowrap text-sm font-medium transition-colors hover:text-primary",
            !activeCategory
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900"
          )}
        >
          Todos
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/?category=${encodeURIComponent(category)}`}
            className={cn(
              "flex-none whitespace-nowrap text-sm font-medium transition-colors hover:text-primary",
              activeCategory === category
                ? "text-primary"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}
