import { NextResponse } from "next/server";
import EmbeddingService from "@/lib/embedding-service";
import PineconeClient from "@/lib/pinecone-client";
import LLMService, { type ChatMessage } from "@/lib/llm-service";

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
    const body = await request.json();
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
    const relevantProducts = searchResults.matches.map(match => ({
      id: match.metadata.id as number,
      name: match.metadata.name as string,
      description: match.metadata.description as string | undefined,
      price: match.metadata.price as number,
      category: match.metadata.category as string,
      stock: match.metadata.stock as number,
      image: match.metadata.image as string | undefined,
    }));

    console.log(`✅ Encontrados ${relevantProducts.length} productos relevantes`);

    // PASO 2: RAG - Generation (Generación)
    // Generar respuesta natural con contexto de productos
    const response = await LLMService.generateResponse(
      message,
      relevantProducts,
      conversationHistory as ChatMessage[]
    );

    console.log("✅ Respuesta generada con Gemini");

    return NextResponse.json({
      message: response,
      products: relevantProducts,
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
