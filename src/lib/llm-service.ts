/**
 * Servicio para generación de respuestas con Google Gemini
 * Utiliza RAG (Retrieval-Augmented Generation) con contexto de productos
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

/**
 * Servicio para generar respuestas usando Google Gemini
 */
class LLMService {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Inicializa el cliente de Google Generative AI (lazy loading)
   */
  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = env.GOOGLE_API_KEY;
      
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY no está configurada en las variables de entorno");
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
    }

    return this.genAI;
  }

  /**
   * Genera una respuesta usando Gemini con contexto de productos
   * @param userQuery - Consulta del usuario
   * @param relevantProducts - Productos relevantes encontrados en Pinecone
   * @param conversationHistory - Historial de conversación (opcional)
   * @returns Respuesta generada por Gemini
   */
  static async generateResponse(
    userQuery: string,
    relevantProducts: Product[],
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    const genAI = this.getClient();
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: `Eres un asistente virtual de NexoShop, una tienda de e-commerce.

Tu trabajo es ayudar a los clientes a:
- Encontrar productos que buscan
- Consultar stock y disponibilidad
- Obtener información de precios  
- Conocer detalles y características

Directrices:
- Responde en español de forma amigable y profesional
- Sé conciso pero completo
- Si mencionas productos, incluye nombre y precio
- Si no hay productos relevantes, sugiere alternativas o pregunta más detalles
- No inventes información que no esté en el contexto
- Si un producto no tiene stock, menciona que está agotado
- Usa formato natural y conversacional`
    });

    // Construir contexto de productos
    const contextText = relevantProducts.length > 0
      ? relevantProducts.map(p => {
          const stockStatus = p.stock > 0 ? `${p.stock} disponibles` : 'Agotado';
          return `- ${p.name}: $${p.price.toLocaleString('es-AR')} (${stockStatus})
  ${p.description || ''}`;
        }).join('\n')
      : 'No se encontraron productos específicos para esta consulta.';

    // Construir historial (últimos 10 mensajes)
    const history = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });

    const prompt = `Productos disponibles:
${contextText}

Pregunta del cliente: ${userQuery}`;

    try {
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error al generar respuesta con Gemini:", error);
      throw error;
    }
  }
}

export default LLMService;
