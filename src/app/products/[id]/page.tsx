import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ShoppingCart, ArrowLeft, PackageCheck, TruckIcon } from "lucide-react";
import Link from "next/link";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  // Obtener producto de la base de datos
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header con botón de volver */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a la tienda</span>
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen del producto */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
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
                  <ShoppingCart className="w-32 h-32 text-gray-300 dark:text-gray-700" />
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="flex flex-col">
            {/* Categoría */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-800">
                {product.category}
              </span>
            </div>

            {/* Nombre */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-black dark:text-white">
                ${product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <PackageCheck className="w-5 h-5" />
                  <span className="font-medium">
                    {product.stock} unidades disponibles
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <PackageCheck className="w-5 h-5" />
                  <span className="font-medium">Sin stock</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Descripción
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Botón de agregar al carrito */}
            <div className="mt-auto">
              <button
                disabled={product.stock === 0}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {product.stock > 0 ? "Agregar al carrito" : "Producto agotado"}
                </span>
              </button>

              {/* Info de envío */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <TruckIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Envío gratis en compras superiores a $100.000
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Recibirás tu pedido en 3-5 días hábiles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
