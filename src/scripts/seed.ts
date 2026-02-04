import { db } from "../server/db";
import { products, shippingCosts } from "../server/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Seed Products
    console.log("📦 Seeding products...");
    await db.insert(products).values([
      {
        name: "Zapatillas Running Pro",
        description: "Zapatillas de alto rendimiento para correr largas distancias. Amortiguación superior.",
        price: "15000.00",
        category: "Calzado",
        stock: 50,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      },
      {
        name: "Remera Deportiva Dry-Fit",
        description: "Remera transpirable ideal para entrenamientos intensos. Tecnología de secado rápido.",
        price: "5000.00",
        category: "Indumentaria",
        stock: 100,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
      },
      {
        name: "Medias de Compresión",
        description: "Mejoran la circulación sanguínea durante el ejercicio. Pack x3.",
        price: "3000.00",
        category: "Accesorios",
        stock: 200,
        image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50f82?q=80&w=2070&auto=format&fit=crop",
      },
      {
        name: "Gorra Running",
        description: "Gorra ligera y ajustable. Protección UV.",
        price: "4500.00",
        category: "Accesorios",
        stock: 30,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89d?q=80&w=1936&auto=format&fit=crop",
      },
      {
        name: "Short Deportivo",
        description: "Short liviano con bolsillos laterales.",
        price: "6000.00",
        category: "Indumentaria",
        stock: 75,
        image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
      }
    ]).onConflictDoNothing(); // Prevent duplicates if already seeded

    // 2. Seed Shipping Costs
    console.log("🚚 Seeding shipping costs...");
    await db.insert(shippingCosts).values([
      { postalCode: "1001", price: "1500.00" }, // CABA cheap
      { postalCode: "1414", price: "1500.00" },
      { postalCode: "5000", price: "2500.00" }, // Córdoba medium
      { postalCode: "8000", price: "3500.00" }, // Bahía Blanca expensive
      { postalCode: "9410", price: "4500.00" }, // Ushuaia very expensive
    ]).onConflictDoNothing();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
