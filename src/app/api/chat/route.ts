import { NextResponse } from "next/server";
import EmbeddingService from "@/lib/embedding-service";
import PineconeClient from "@/lib/pinecone-client";
import LLMService, { type ChatMessage } from "@/lib/llm-service";

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

/**
 * Endpoint de chat con RAG (Retrieval-Augmented Generation)
 * 
 * POST /api/chat
 * Body: {
 *   message: string,
 *   conversationHistory?: ChatMessage[]
 * }
 * 
 * Response: {
 *   message: string,
 *   products: Product[],
 *   timestamp: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: unknown;
      conversationHistory?: ChatMessage[];
    };
    const { message, conversationHistory = [] } = body;

    // Validación
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido y debe ser un string" },
        { status: 400 }
      );
    }

    console.log("💬 Query del usuario:", message);

    // PASO 1: RAG - Retrieval (Recuperación)
    // Generar embedding del query del usuario
    const queryEmbedding = await EmbeddingService.generateEmbedding(message);
    console.log("✅ Embedding del query generado");

    // Buscar productos similares en Pinecone
    const searchResults = await PineconeClient.query(
      queryEmbedding,
      5, // Top 5 productos más relevantes
      { stock: { $gt: 0 } } // Filtro: solo productos con stock disponible
    );

    // Extraer metadata de productos
    const relevantProducts = searchResults.matches
      .map((match) => match.metadata)
      .filter(isProductMetadata)
      .map((metadata) => ({
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        price: metadata.price,
        category: metadata.category,
        stock: metadata.stock,
        image: metadata.image,
      }));

    console.log(`✅ Encontrados ${relevantProducts.length} productos relevantes`);

    // PASO 2: RAG - Generation (Generación)
    // Generar respuesta natural con contexto de productos
    const response = await LLMService.generateResponse(
      message,
      relevantProducts,
      conversationHistory
    );

    console.log("✅ Respuesta generada con Gemini");

    // PASO 3: Filtrar productos mencionados en la respuesta
    // Solo mostrar productos que realmente se mencionan en el texto de respuesta
    const mentionedProducts = relevantProducts.filter(product => {
      // Normalizar nombres para comparación (sin acentos, minúsculas)
      const normalizedResponse = response
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      const normalizedProductName = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Verificar si el nombre del producto está en la respuesta
      return normalizedResponse.includes(normalizedProductName);
    });

    console.log(`✅ Productos mencionados en respuesta: ${mentionedProducts.length}`);

    return NextResponse.json({
      message: response,
      products: mentionedProducts, // Solo productos mencionados
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /api/chat:", error);
    return NextResponse.json(
      { 
        error: "Error al procesar la consulta",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
