import ProductCard from "./components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

async function getProducts(category?: string): Promise<Product[]> {
  // Use relative path for API routes - works in both dev and production
  let url = "/api/products";
  
  if (category) {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url, {
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
