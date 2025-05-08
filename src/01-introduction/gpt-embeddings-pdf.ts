import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createVectorStore } from "./search-embeddings-pdf";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import * as readline from 'readline';

/**
 * ChatOpenAI é uma classe que fornece uma interface para interagir com os modelos GPT da OpenAI.
 * Configurações:
 * - model: "gpt-4" - Define o modelo a ser usado (GPT-4)
 * - temperature: 0 - Controla a aleatoriedade das respostas (0 = mais determinístico)
 */
const openAiChat = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
});

/**
 * PromptTemplate é uma classe que ajuda a criar prompts estruturados para o LLM.
 * - template: Define o formato do prompt com placeholders para {context} e {question}
 * - inputVariables: Especifica quais variáveis serão substituídas no template
 * O template inclui instruções claras para o modelo sobre como responder às perguntas
 */
const promptTemplate = new PromptTemplate({
  template: `
Você é um assistente útil que responde perguntas com base no contexto fornecido.

Contexto:
{context}

Pergunta:
{question}

Instruções:
- Responda à pergunta com base apenas nas informações fornecidas no contexto acima.
- Se a informação necessária para responder à pergunta não estiver no contexto, responda com "Não tenho informações suficientes para responder a essa pergunta."
- Seja claro, conciso e útil em suas respostas.
- Não invente informações que não estejam presentes no contexto.
`.trim(),
  inputVariables: ["context", "question"],
});

/**
 * readline.createInterface cria uma interface para leitura de input do usuário no terminal
 * - input: process.stdin - Define a entrada como o terminal
 * - output: process.stdout - Define a saída como o terminal
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question
const askQuestion = (rl: readline.Interface): Promise<string> => {
  return new Promise((resolve) => {
    rl.question('\nFaça sua pergunta (ou digite "sair" para encerrar): ', (answer) => {
      resolve(answer);
    });
  });
};

// Main function to run the PDF loading
async function main() {
  const vectorStore = await createVectorStore();

  /**
   * RunnableSequence é uma classe que permite criar uma sequência de operações encadeadas.
   * Neste caso, a sequência é:
   * 1. Recebe a pergunta e busca documentos relevantes no vectorStore
   * 2. Formata os documentos encontrados como string
   * 3. Passa o contexto e a pergunta para o promptTemplate
   * 4. Envia o prompt formatado para o ChatOpenAI
   * 5. Processa a resposta através do StringOutputParser
   */
  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await vectorStore.similaritySearch(input.question, 3);
        return formatDocumentsAsString(docs);
      },
      question: (input: { question: string }) => input.question,
    },
    promptTemplate,
    openAiChat,
    new StringOutputParser(),
  ]);

  console.log('Bem-vindo ao chat! Você pode fazer perguntas sobre o conteúdo do documento.');
  
  while (true) {
    const question = await askQuestion(rl);
    
    if (question.toLowerCase() === 'sair') {
      console.log('Encerrando o chat. Até logo!');
      break;
    }

    try {
      const result = await chain.invoke({
        question: question,
      });
      console.log('\nResposta:', result);
    } catch (error) {
      console.error('Erro ao processar a pergunta:', error);
    }
  }

  rl.close();
}

// Execute the main function
main().catch(console.error);