"use client";

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, PackageCheck, TruckIcon, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  category: string;
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, removeFromCart, getProductQuantity } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
          notFound();
          return;
        }

        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [params]);

  const cartQuantity = product ? getProductQuantity(product.id) : 0;

  const handleAddToCart = () => {
    if (!product) return;

    const currentQty = getProductQuantity(product.id);

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
      image: product.image ?? "",
    });

    setTimeout(() => {
      toast({
        title: "Producto agregado",
        description: `${product.name} agregado al carrito`,
      });
    }, 0);
  };

  const handleIncrement = () => {
    if (!product) return;

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

  const handleDecrement = () => {
    if (!product) return;

    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  const handleRemove = () => {
    if (!product) return;

    removeFromCart(product.id);
    setTimeout(() => {
      toast({
        title: "Producto eliminado",
        description: `${product.name} ha sido eliminado del carrito`,
      });
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen del producto */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-white">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="flex flex-col">
            {/* Categoría */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 uppercase">
                {product.category}
              </span>
            </div>

            {/* Nombre */}
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-black">
                ${product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <PackageCheck className="w-5 h-5" />
                  <span className="font-medium">
                    Stock: {product.stock}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <PackageCheck className="w-5 h-5" />
                  <span className="font-medium">Sin stock</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-black mb-3">
                  Descripción
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Controles del carrito */}
            <div className="mt-auto">
              {cartQuantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {product.stock > 0 ? "Agregar al carrito" : "Producto agotado"}
                  </span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {/* Controles de cantidad */}
                    <div className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg">
                      <button
                        onClick={handleDecrement}
                        disabled={cartQuantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-6 font-semibold text-lg">{cartQuantity}</span>
                      <button
                        onClick={handleIncrement}
                        disabled={cartQuantity >= product.stock}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      onClick={handleRemove}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    Producto en el carrito
                  </p>
                </div>
              )}

              {/* Info de envío */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <TruckIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-black">
                      Envío gratis en compras superiores a $100.000
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Recibirás tu pedido en 3-5 días hábiles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
