/**
 * Servicio para generar embeddings de texto usando Google Generative AI
 * Utiliza el modelo gemini-embedding-001
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Tipo para el producto
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  stock: number;
  image: string | null;
}

/**
 * Servicio para generar embeddings de texto usando Google Generative AI
 */
class EmbeddingService {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Inicializa el cliente de Google Generative AI (lazy loading)
   */
  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = env.GOOGLE_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GOOGLE_API_KEY no está configurada en las variables de entorno",
        );
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log("✅ Google Generative AI cliente inicializado");
    }

    return this.genAI;
  }

  /**
   * Genera un embedding (vector) para un texto dado usando Google AI
   * @param text - Texto a convertir en embedding
   * @returns Array de números (vector de 768 dimensiones)
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const genAI = this.getClient();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(text);

      return result.embedding.values;
    } catch (error) {
      console.error("Error al generar embedding con Google AI:", error);
      throw error;
    }
  }

  /**
   * Prepara el texto de un producto para generar el embedding
   * Combina nombre, descripción, categoría y precio en un texto rico
   * @param product - Producto a procesar
   * @returns Texto optimizado para embeddings
   */
  static prepareProductText(product: Product): string {
    const parts: string[] = [];

    // Nombre del producto (peso alto)
    if (product.name) {
      parts.push(`Producto: ${product.name}`);
    }

    // Descripción (peso alto)
    if (product.description) {
      parts.push(`Descripción: ${product.description}`);
    }

    // Categoría (peso medio)
    if (product.category) {
      parts.push(`Categoría: ${product.category}`);
    }

    // Precio (peso bajo, pero útil para búsquedas por rango)
    if (product.price) {
      const priceNum = Number(product.price);
      parts.push(`Precio: $${priceNum.toLocaleString("es-AR")}`);
    }

    // Stock (útil para disponibilidad)
    if (product.stock !== undefined) {
      const availability = product.stock > 0 ? "Disponible" : "Sin stock";
      parts.push(availability);
    }

    return parts.join(". ");
  }

  /**
   * Genera embeddings para múltiples textos de manera eficiente
   * Google AI permite procesamiento en batch
   * @param texts - Array de textos
   * @returns Array de embeddings
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embeddings: number[][] = [];

    // Google AI permite batch, pero procesamos de a uno por seguridad
    // para evitar problemas con rate limiting
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await model.embedContent(texts[i]!);
        embeddings.push(result.embedding.values);

        // Pequeño delay para no saturar la API
        if (i < texts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Mostrar progreso cada 5 productos
        if ((i + 1) % 5 === 0 || i === texts.length - 1) {
          console.log(`   Procesados ${i + 1}/${texts.length} embeddings`);
        }
      } catch (error) {
        console.error(`Error procesando embedding ${i + 1}:`, error);
        throw error;
      }
    }

    return embeddings;
  }
}

export default EmbeddingService;
