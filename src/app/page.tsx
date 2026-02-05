import ProductCard from "./components/ProductCard";
import { getProductsFromDb, type Product } from "@/server/db/queries/products";

export default async function HomePage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  
  // Call database directly instead of fetching API route
  // This avoids 401 errors when Vercel deployment protection is enabled
  const products = await getProductsFromDb(searchParams.category);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {searchParams.category ? decodeURIComponent(searchParams.category) : "Productos Destacados"}
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Descubre nuestra selección de productos más populares
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
