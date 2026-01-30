import { ProductCard } from "./components/ProductCard";
import { Header } from "./components/Header";
import { ShippingBanner } from "./components/ShippingBanner";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

async function getProducts(category?: string): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = new URL(`${baseUrl}/api/products`);
  
  if (category) {
    url.searchParams.set("category", category);
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = (await res.json()) as Product[];
  return data;
}

export default async function HomePage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const products = await getProducts(searchParams.category);

  return (
    <div className="min-h-screen bg-white">
      <ShippingBanner />
      <Header />

      <main className="container mx-auto px-4 py-8">
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
