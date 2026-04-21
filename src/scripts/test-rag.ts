/**
 * Script de prueba para verificar el sistema RAG
 * Ejecutar con: pnpm test:rag
 */

import EmbeddingService from "../lib/embedding-service";
import PineconeClient from "../lib/pinecone-client";
import LLMService from "../lib/llm-service";

function isProductMetadata(
  metadata: unknown,
): metadata is {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
} {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  const candidate = metadata as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.category === "string" &&
    typeof candidate.stock === "number"
  );
}

async function testRAGSystem() {
  console.log("🧪 Iniciando pruebas del sistema RAG\n");

  try {
    // Test 1: Búsqueda Semántica
    console.log("📊 Test 1: Búsqueda Semántica");
    console.log("─".repeat(50));
    
    const query = "zapatillas para correr";
    console.log(`Query: "${query}"\n`);

    // Generar embedding
    const embedding = await EmbeddingService.generateEmbedding(query);
    console.log(`✅ Embedding generado (${embedding.length} dimensiones)`);

    // Buscar en Pinecone
    const results = await PineconeClient.query(embedding, 3);
    console.log(`✅ Encontrados ${results.matches.length} productos\n`);

    const matchesWithMetadata = results.matches.filter(
      (
        match,
      ): match is typeof match & {
        metadata: {
          id: number;
          name: string;
          description?: string;
          price: number;
          category: string;
          stock: number;
          image?: string;
        };
      } => isProductMetadata(match.metadata),
    );

    // Mostrar resultados
    matchesWithMetadata.forEach((match, index) => {
        console.log(`${index + 1}. ${match.metadata.name}`);
        console.log(`   Precio: $${match.metadata.price}`);
        console.log(`   Stock: ${match.metadata.stock}`);
        console.log(`   Score: ${match.score?.toFixed(3)}\n`);
      });

    // Test 2: Generación de Respuesta
    console.log("\n💬 Test 2: Generación de Respuesta con Gemini");
    console.log("─".repeat(50));

    const products = matchesWithMetadata
      .map((match) => match.metadata)
      .map((metadata) => ({
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        price: metadata.price,
        category: metadata.category,
        stock: metadata.stock,
        image: metadata.image,
      }));

    console.log(`Generando respuesta para: "${query}"\n`);
    
    const response = await LLMService.generateResponse(query, products);
    console.log("Respuesta de Gemini:");
    console.log("─".repeat(50));
    console.log(response);
    console.log("─".repeat(50));

    // Test 3: Conversación con Contexto
    console.log("\n\n🔄 Test 3: Conversación con Contexto");
    console.log("─".repeat(50));

    const conversationHistory = [
      { role: "user" as const, content: "Busco zapatillas" },
      { role: "assistant" as const, content: "Tengo varias opciones de zapatillas..." }
    ];

    const followUpQuery = "¿Cuál es la más barata?";
    console.log(`Query de seguimiento: "${followUpQuery}"\n`);

    const followUpResponse = await LLMService.generateResponse(
      followUpQuery,
      products,
      conversationHistory
    );

    console.log("Respuesta con contexto:");
    console.log("─".repeat(50));
    console.log(followUpResponse);
    console.log("─".repeat(50));

    console.log("\n\n✅ Todas las pruebas completadas exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`  - Embeddings: ✅ Funcionando`);
    console.log(`  - Búsqueda Pinecone: ✅ Funcionando`);
    console.log(`  - Generación Gemini: ✅ Funcionando`);
    console.log(`  - Contexto conversacional: ✅ Funcionando`);

  } catch (error) {
    console.error("\n❌ Error durante las pruebas:", error);
    throw error;
  }
}

// Ejecutar tests
testRAGSystem()
  .then(() => {
    console.log("\n✨ Proceso de pruebas completado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Proceso fallido:", error);
    process.exit(1);
  });
