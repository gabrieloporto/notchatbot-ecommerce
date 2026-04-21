import { NextResponse } from "next/server";
import EmbeddingService from "@/lib/embedding-service";
import PineconeClient from "@/lib/pinecone-client";

function isSearchProductMetadata(
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
 * Endpoint de búsqueda semántica de productos
 * 
 * POST /api/search/semantic
 * Body: {
 *   query: string,
 *   limit?: number (default: 10),
 *   minScore?: number (default: 0.7)
 * }
 * 
 * Response: {
 *   results: Array<{ product: Product, score: number }>,
 *   query: string,
 *   count: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: unknown;
      limit?: number;
      minScore?: number;
    };
    const { query, limit = 10, minScore = 0.7 } = body;

    // Validación
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "El query es requerido y debe ser un string" },
        { status: 400 }
      );
    }

    console.log("🔍 Búsqueda semántica:", query);

    // Generar embedding del query
    const embedding = await EmbeddingService.generateEmbedding(query);
    console.log("✅ Embedding generado");

    // Buscar en Pinecone
    const results = await PineconeClient.query(embedding, limit);

    // Filtrar por score mínimo y formatear resultados
    const filteredResults = results.matches
      .filter(
        (
          match,
        ): match is typeof match & {
          score: number;
          metadata: {
            id: number;
            name: string;
            description?: string;
            price: number;
            category: string;
            stock: number;
            image?: string;
          };
        } =>
          typeof match.score === "number" &&
          match.score >= minScore &&
          isSearchProductMetadata(match.metadata),
      )
      .map((match) => ({
        product: {
          id: match.metadata.id,
          name: match.metadata.name,
          description: match.metadata.description,
          price: match.metadata.price,
          category: match.metadata.category,
          stock: match.metadata.stock,
          image: match.metadata.image,
        },
        score: match.score,
      }));

    console.log(`✅ ${filteredResults.length} productos encontrados (score >= ${minScore})`);

    return NextResponse.json({
      results: filteredResults,
      query,
      count: filteredResults.length,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda semántica:", error);
    return NextResponse.json(
      { 
        error: "Error en la búsqueda",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
