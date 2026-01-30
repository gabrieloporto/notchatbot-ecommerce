"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Calzado",
  "Buzos y camperas",
  "Remeras y camisas",
  "Ropa interior",
  "Accesorios",
  "Pantalones",
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  // Close sheet when category changes (navigation occurs)
  useEffect(() => {
    setOpen(false);
  }, [activeCategory]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[385px]">
         <SheetTitle className="sr-only">Menu de navegación</SheetTitle>
        <div className="flex flex-col space-y-6 py-6">
          <div className="px-2">
            <Link href="/" onClick={() => setOpen(false)}>
              <span className="text-xl font-bold tracking-tight">
                NotChatbot <span className="text-primary">Store</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-col space-y-3">
             <h3 className="px-2 text-sm font-medium text-gray-500">Categorías</h3>
             <Link
                href="/"
                className={cn(
                  "block px-2 py-1 text-lg font-medium transition-colors hover:text-primary",
                  !activeCategory ? "text-primary" : "text-gray-600"
                )}
                 onClick={() => setOpen(false)}
              >
                Todos
              </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/?category=${encodeURIComponent(category)}`}
                className={cn(
                  "block px-2 py-1 text-lg font-medium transition-colors hover:text-primary",
                  activeCategory === category
                    ? "text-primary"
                    : "text-gray-600"
                )}
                onClick={() => setOpen(false)}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
