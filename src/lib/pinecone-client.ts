import { Pinecone, type Index, type RecordMetadata } from "@pinecone-database/pinecone";
import { env } from "@/env";

/**
 * Metadata que se almacena para cada producto en Pinecone
 */
export type ProductMetadata = RecordMetadata;
type PineconeMetadataFilter = Record<string, Record<string, string | number | boolean>>;

/**
 * Cliente singleton para Pinecone
 * Maneja la conexión y operaciones con la base de datos vectorial
 */
class PineconeClient {
  private static instance: Pinecone | null = null;
  private static indexInstance: Index | null = null;

  /**
   * Obtiene o crea la instancia del cliente de Pinecone
   */
  private static getInstance(): Pinecone {
    if (!this.instance) {
      // Validar que exista la API key
      if (!env.PINECONE_API_KEY) {
        throw new Error(
          "PINECONE_API_KEY no está configurada en las variables de entorno"
        );
      }

      console.log("🔌 Conectando a Pinecone...");
      this.instance = new Pinecone({
        apiKey: env.PINECONE_API_KEY,
      });
      console.log("✅ Conectado a Pinecone");
    }

    return this.instance;
  }

  /**
   * Obtiene el índice de Pinecone configurado
   * @returns Índice de Pinecone para productos
   */
  static getIndex(): Index {
    if (!this.indexInstance) {
      const client = this.getInstance();
      
      // Validar que exista el nombre del índice
      if (!env.PINECONE_INDEX_NAME) {
        throw new Error(
          "PINECONE_INDEX_NAME no está configurado en las variables de entorno"
        );
      }

      console.log(`📊 Accediendo al índice: ${env.PINECONE_INDEX_NAME}`);
      this.indexInstance = client.index(env.PINECONE_INDEX_NAME);
    }

    return this.indexInstance;
  }

  /**
   * Inserta o actualiza vectores en Pinecone
   * @param vectors - Array de vectores a insertar/actualizar
   */
  static async upsert(
    vectors: {
      id: string;
      values: number[];
      metadata: ProductMetadata;
    }[]
  ): Promise<void> {
    const index = this.getIndex();

    try {
      if (vectors.length === 0) {
        throw new Error("El array de vectores está vacío");
      }

      // Pinecone v7 API requiere el formato: { records: [...] }
      await index.upsert({ records: vectors });
      console.log(`✅ ${vectors.length} vectores insertados/actualizados en Pinecone`);
    } catch (error) {
      console.error("❌ Error al insertar vectores en Pinecone:", error);
      throw error;
    }
  }

  /**
   * Busca vectores similares en Pinecone
   * @param vector - Vector de consulta
   * @param topK - Número de resultados a retornar
   * @param filter - Filtro opcional para metadata
   * @returns Resultados de la búsqueda
   */
  static async query(
    vector: number[],
    topK = 5,
    filter?: PineconeMetadataFilter,
  ) {
    const index = this.getIndex();

    try {
      const results = await index.query({
        vector,
        topK,
        includeMetadata: true,
        filter,
      });

      console.log(`🔍 Encontrados ${results.matches.length} resultados en Pinecone`);
      return results;
    } catch (error) {
      console.error("❌ Error al buscar en Pinecone:", error);
      throw error;
    }
  }

  /**
   * Elimina un vector de Pinecone por ID
   * @param id - ID del vector a eliminar
   */
  static async deleteOne(id: string): Promise<void> {
    const index = this.getIndex();

    try {
      await index.deleteOne({ id });
      console.log(`🗑️ Vector ${id} eliminado de Pinecone`);
    } catch (error) {
      console.error("❌ Error al eliminar vector de Pinecone:", error);
      throw error;
    }
  }

  /**
   * Elimina múltiples vectores de Pinecone
   * @param ids - Array de IDs a eliminar
   */
  static async deleteMany(ids: string[]): Promise<void> {
    const index = this.getIndex();

    try {
      await index.deleteMany(ids);
      console.log(`🗑️ ${ids.length} vectores eliminados de Pinecone`);
    } catch (error) {
      console.error("❌ Error al eliminar vectores de Pinecone:", error);
      throw error;
    }
  }

  /**
   * Elimina todos los vectores del índice
   * ⚠️ USAR CON PRECAUCIÓN
   */
  static async deleteAll(): Promise<void> {
    const index = this.getIndex();

    try {
      await index.deleteAll();
      console.log("🗑️ Todos los vectores eliminados de Pinecone");
    } catch (error) {
      console.error("❌ Error al eliminar todos los vectores:", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del índice
   */
  static async getStats() {
    const index = this.getIndex();

    try {
      const stats = await index.describeIndexStats();
      console.log("📊 Estadísticas del índice:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error);
      throw error;
    }
  }
}

export default PineconeClient;
