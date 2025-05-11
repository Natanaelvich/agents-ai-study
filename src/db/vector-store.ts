import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { PoolConfig } from "pg";
import { products } from "./schema";

const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
  } as PoolConfig,
  tableName: "product_embeddings",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  distanceStrategy: "cosine" as const,
};

let vectorStore: PGVectorStore | null = null;

export async function getVectorStore() {
  if (!vectorStore) {
    const embeddings = new OpenAIEmbeddings();
    vectorStore = await PGVectorStore.initialize(embeddings, config);
    
    // Criar índice HNSW para busca mais rápida
    await vectorStore.createHnswIndex({
      dimensions: 1536,
      efConstruction: 64,
      m: 16,
    });
  }
  return vectorStore;
}

export async function addProductToVectorStore(product: typeof products.$inferSelect) {
  const store = await getVectorStore();
  
  const text = `Nome: ${product.name}\nDescrição: ${product.description || ''}\nPreço: ${product.price}\nCaracterísticas: ${JSON.stringify(product.features || {})}`;
  
  await store.addDocuments([
    {
      pageContent: text,
      metadata: {
        productId: product.id,
        name: product.name,
        price: product.price,
        features: product.features,
      },
    },
  ]);
}

export async function findSimilarProducts(query: string, limit: number = 3) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, limit);
  return results;
}

export async function closeVectorStore() {
  if (vectorStore) {
    await vectorStore.end();
    vectorStore = null;
  }
} 