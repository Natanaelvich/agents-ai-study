import {
    PGVectorStore,
    DistanceStrategy,
  } from "@langchain/community/vectorstores/pgvector";
  import { OpenAIEmbeddings } from "@langchain/openai";
  import { PoolConfig } from "pg";
  
  export const createVectorStore = async () => {
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });
    // Sample config
    const config = {
      postgresConnectionOptions: {
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "vectordb",
      } as PoolConfig,
      tableName: "testlangchainjs_faq",
      columns: {
        idColumnName: "id",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
      // supported distance strategies: cosine (default), innerProduct, or euclidean
      distanceStrategy: "cosine" as DistanceStrategy,
    };
  
    const vectorStore = await PGVectorStore.initialize(embeddings, config);
  
    return vectorStore;
  };
  
  export const searchEmbeddings = async (query: string) => {
    const vectorStore = await createVectorStore();
  
    const results = await vectorStore.similaritySearch(query, 5);
  
    await vectorStore.end();
  
    return results;
  };
  