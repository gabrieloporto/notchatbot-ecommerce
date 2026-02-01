/**
 * Script para sincronizar productos de PostgreSQL a Pinecone
 * Ejecutar con: pnpm sync:pinecone
 */

import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import EmbeddingService from "@/lib/embedding-service";
import PineconeClient from "@/lib/pinecone-client";

async function syncProductsToPinecone() {
  console.log("🚀 Iniciando sincronización de productos a Pinecone...\n");

  try {
    // Paso 1: Obtener todos los productos de PostgreSQL
    console.log("📦 Obteniendo productos de PostgreSQL...");
    const allProducts = await db.select().from(products);
    console.log(`✅ ${allProducts.length} productos encontrados\n`);

    if (allProducts.length === 0) {
      console.log("⚠️ No hay productos para sincronizar");
      return;
    }

    // Paso 2: Generar embeddings para cada producto
    console.log("🔄 Generando embeddings para productos usando Google AI...");
    const vectors = [];

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]!;
      
      // Preparar texto del producto
      const text = EmbeddingService.prepareProductText({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        image: product.image,
      });

      // Generar embedding
      const embedding = await EmbeddingService.generateEmbedding(text);

      // Verificar que el embedding no esté vacío
      if (!embedding || embedding.length === 0) {
        console.warn(`⚠️ Embedding vacío para producto ${product.id}, saltando...`);
        continue;
      }

      // Crear metadata sin valores null/undefined
      const metadata: Record<string, string | number> = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        stock: product.stock,
      };

      // Agregar campos opcionales solo si existen
      if (product.description) {
        metadata.description = product.description;
      }
      if (product.image) {
        metadata.image = product.image;
      }

      // Crear vector para Pinecone
      vectors.push({
        id: `product-${product.id}`,
        values: embedding,
        metadata,
      });

      // Mostrar progreso
      if ((i + 1) % 10 === 0 || i === allProducts.length - 1) {
        console.log(`   Procesados ${i + 1}/${allProducts.length} productos`);
      }
    }

    console.log(`✅ ${vectors.length} embeddings generados\n`);

    // Paso 3: Insertar vectores en Pinecone en batches
    console.log("📤 Insertando vectores en Pinecone...");
    const batchSize = 100;
    let totalUpserted = 0;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await PineconeClient.upsert(batch);
      totalUpserted += batch.length;
      console.log(`   Sincronizados ${totalUpserted}/${vectors.length} productos`);
    }

    console.log(`\n✅ Sincronización completada exitosamente!`);
    console.log(`   Total de productos sincronizados: ${totalUpserted}`);

    // Paso 4: Verificar estadísticas del índice
    console.log("\n📊 Estadísticas del índice:");
    const stats = await PineconeClient.getStats();
    console.log(`   Total de vectores en Pinecone: ${stats.totalRecordCount ?? 0}`);
    console.log(`   Namespaces: ${Object.keys(stats.namespaces ?? {}).length || 1}`);

  } catch (error) {
    console.error("\n❌ Error durante la sincronización:", error);
    throw error;
  }
}

// Ejecutar el script
syncProductsToPinecone()
  .then(() => {
    console.log("\n✨ Proceso completado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Proceso fallido:", error);
    process.exit(1);
  });
