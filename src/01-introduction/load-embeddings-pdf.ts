import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import {
  PGVectorStore,
  DistanceStrategy,
} from "@langchain/community/vectorstores/pgvector";
import fs from "fs";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PoolConfig } from "pg";

const pdfDirectory = path.join(process.cwd(), "tmp", "pdf");

// Function to load all PDFs from the directory
async function loadPDFsFromDirectory() {
  const files = fs.readdirSync(pdfDirectory);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  const loaders = pdfFiles.map((file) => {
    const filePath = path.join(pdfDirectory, file);
    return new PDFLoader(filePath);
  });

  return loaders;
}

async function loadDocs() {
  const loaders = await loadPDFsFromDirectory();
  const docs: Document[] = [];

  await Promise.all(
    loaders.map(async (loader) => {
      const docsLoaded = await loader.load();
      docs.push(docsLoaded[0]);
    })
  );

  return docs;
}

// Main function to run the PDF loading
async function main() {
  const docs = await loadDocs();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);

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
    tableName: "testlangchainjs",
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

  await vectorStore.addDocuments(splitDocs);

  await vectorStore.end();
}

// Execute the main function
main().catch(console.error);
