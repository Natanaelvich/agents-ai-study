import path from "path";
import fs from "fs";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore } from "./search-faq";

const jsonDirectory = path.join(process.cwd(), "tmp", "faq-data");

// Função para carregar todos os JSONs do diretório
async function loadJSONsFromDirectory() {
  // readdirSync lê o conteúdo de um diretório de forma síncrona
  // Retorna um array com os nomes dos arquivos no diretório
  const files = fs.readdirSync(jsonDirectory);
  
  // Filtra apenas os arquivos JSON do diretório
  const jsonFiles = files.filter((file) =>
    file.toLowerCase().endsWith(".json")
  );


  // Lê cada arquivo JSON e retorna seu conteúdo
  return jsonFiles.map((file) => {
    const filePath = path.join(jsonDirectory, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      content: JSON.parse(content),
      filePath
    };
  });
}

async function loadDocs() {
  const jsonFiles = await loadJSONsFromDirectory();
  const docs: Document[] = [];

  // Processa cada arquivo JSON
  jsonFiles.forEach(({ content, filePath }) => {
    // Processa cada FAQ individualmente
    content.faqs.forEach((faq: any) => {
      // Cria um documento para cada FAQ com seus metadados
      const doc = new Document({
        pageContent: `Pergunta: ${faq.question}\nResposta: ${faq.answer}`,
        metadata: {
          id: faq.id,
          category: content.category,
          tags: faq.tags,
          last_updated: faq.last_updated,
          // Campos específicos por categoria
          ...(faq.related_products && { related_products: faq.related_products }),
          ...(faq.service_type && { service_type: faq.service_type }),
          ...(faq.difficulty && { difficulty: faq.difficulty })
        }
      });
      docs.push(doc);
    });
  });

  return docs;
}

// Função principal para carregar os JSONs
async function main() {
  const docs = await loadDocs();

  // RecursiveCharacterTextSplitter é uma utilidade de divisão de texto que:
  // 1. Divide o texto em pedaços menores mantendo o conteúdo relacionado junto
  // 2. Usa uma abordagem recursiva para dividir em diferentes caracteres (quebras de linha, pontos, etc.)
  // 3. Mantém uma sobreposição entre os pedaços para preservar o contexto
  // 4. Ajuda a prevenir perda de informação ao processar documentos longos
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,    // Tamanho máximo de cada pedaço de texto
    chunkOverlap: 200,  // Número de caracteres para sobrepor entre os pedaços
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const vectorStore = await createVectorStore();

  await vectorStore.addDocuments(splitDocs);

  await vectorStore.end();
}

// Executa a função principal
main().catch(console.error);
