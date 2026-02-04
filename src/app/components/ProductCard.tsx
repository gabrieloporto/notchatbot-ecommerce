"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/utils/formatPrice";

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
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string;
    image: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, updateQuantity, removeFromCart, getProductQuantity } = useCart();
  const cartQuantity = getProductQuantity(product.id);
  const isInCart = cartQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentQty = getProductQuantity(product.id);
    
    // Verificar stock antes de agregar
    if (currentQty + 1 > product.stock) {
      setTimeout(() => {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles`,
          variant: "destructive",
        });
      }, 0);
      return;
    }
    
    addToCart({ 
      ...product, 
      description: product.description ?? "",
      image: product.image ?? ""
    });
    
    setTimeout(() => {
      toast({
        title: "Producto agregado",
        description: `${product.name} agregado al carrito`,
      });
    }, 0);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQuantity < product.stock) {
      updateQuantity(product.id, cartQuantity + 1);
    } else {
      setTimeout(() => {
        toast({
          title: "Stock máximo alcanzado",
          description: `No puedes agregar más de ${product.stock} unidades`,
          variant: "destructive",
        });
      }, 0);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(product.id);
    setTimeout(() => {
      toast({
        title: "Producto eliminado",
        description: `${product.name} ha sido eliminado del carrito`,
      });
    }, 0);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Imagen */}
        <div className="relative h-64 bg-gray-100 overflow-hidden flex-shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-1">
          {/* Categoría */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Nombre */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>

          {/* Descripción - altura fija */}
          <div className="h-10 mb-3">
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Precio y Stock */}
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              {product.stock > 0 ? (
                <span className="text-green-600">Stock: {product.stock}</span>
              ) : (
                <span className="text-red-600">Sin stock</span>
              )}
            </p>
          </div>

          {/* Botones - al final con mt-auto */}
          <div className="mt-auto">
            {product.stock > 0 && (
              <>
                {!isInCart ? (
                  // Botón "Agregar" cuando no está en el carrito
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar
                  </button>
                ) : (
                  // Controles de cantidad cuando está en el carrito
                  <div className="w-full flex items-center justify-center gap-2">
                    {/* Selector de cantidad - más compacto */}
                    <div className="w-1/2 flex items-center justify-center border border-gray-300 rounded-lg">
                      <button
                        onClick={handleDecrement}
                        disabled={cartQuantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 min-w-[2.5rem] text-center font-medium text-sm">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={cartQuantity >= product.stock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón de eliminar con texto */}
                    <button
                      onClick={handleRemove}
                      className="w-1/2 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </>
            )}

            {product.stock === 0 && (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
              >
                Producto agotado
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
