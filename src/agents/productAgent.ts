import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { getVectorStore, closeVectorStore } from "../db/vector-store";

/**
 * ProductAgent é uma classe que implementa um agente de vendas especializado em produtos.
 * Ele utiliza LangChain para criar uma pipeline de processamento que:
 * 1. Busca produtos similares usando vector store
 * 2. Formata o contexto com os produtos encontrados
 * 3. Gera uma resposta contextualizada usando GPT
 */
export class ProductAgent {
  private model: ChatOpenAI;
  private promptTemplate: PromptTemplate;
  private chain: RunnableSequence;

  constructor() {
    /**
     * ChatOpenAI é uma classe que fornece uma interface para interagir com os modelos GPT da OpenAI.
     * Configurações:
     * - modelName: "gpt-3.5-turbo" - Modelo mais rápido e econômico, adequado para respostas curtas
     * - temperature: 0.7 - Controla a aleatoriedade das respostas (0 = mais determinístico, 1 = mais criativo)
     *   Um valor de 0.7 permite um bom equilíbrio entre consistência e naturalidade nas respostas
     */
    this.model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7
    });

    /**
     * PromptTemplate é uma classe que ajuda a criar prompts estruturados para o LLM.
     * Benefícios:
     * - Separa a lógica do prompt do código
     * - Facilita a manutenção e ajustes no prompt
     * - Permite reutilização do mesmo template em diferentes contextos
     * - Garante consistência nas respostas
     * 
     * O template inclui:
     * - Role: Define o papel do assistente (especialista em vendas)
     * - Contexto: Informações sobre produtos relevantes
     * - Pergunta: A dúvida do cliente
     * - Instruções: Diretrizes claras para o modelo
     */
    this.promptTemplate = new PromptTemplate({
      template: `
Você é um assistente de vendas especializado em produtos.

Contexto sobre produtos relevantes:
{context}

Pergunta do cliente:
{question}

Instruções:
- Responda à pergunta usando as informações dos produtos fornecidas no contexto.
- Se não houver produtos relevantes no contexto, responda educadamente que não encontrou produtos que atendam à necessidade.
- Seja claro, conciso e útil em suas respostas.
- Não invente informações sobre produtos que não estejam no contexto.
- Mantenha um tom profissional e amigável.
`.trim(),
      inputVariables: ["context", "question"],
    });

    /**
     * RunnableSequence é uma classe que permite criar uma sequência de operações encadeadas.
     * Benefícios:
     * - Encadeamento declarativo de operações
     * - Melhor legibilidade e manutenção
     * - Facilita a adição/remoção de etapas
     * - Gerencia automaticamente o fluxo de dados entre as etapas
     * 
     * A sequência é:
     * 1. Recebe a pergunta e busca documentos relevantes no vectorStore
     * 2. Formata os documentos encontrados como string
     * 3. Passa o contexto e a pergunta para o promptTemplate
     * 4. Envia o prompt formatado para o ChatOpenAI
     * 5. Processa a resposta através do StringOutputParser
     */
    this.chain = RunnableSequence.from([
      {
        context: async (input: { question: string }) => {
          const vectorStore = await getVectorStore();
          const docs = await vectorStore.similaritySearch(input.question, 3);
          return formatDocumentsAsString(docs);
        },
        question: (input: { question: string }) => input.question,
      },
      this.promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);
  }

  /**
   * Processa uma pergunta do cliente e retorna uma resposta contextualizada.
   * 
   * O método chain.invoke:
   * - Executa a sequência de operações definida no construtor
   * - Gerencia automaticamente o fluxo de dados entre as etapas
   * - Trata erros em cada etapa da sequência
   * - Retorna o resultado final processado
   * 
   * @param question A pergunta do cliente
   * @returns Uma resposta contextualizada baseada nos produtos relevantes
   */
  async processQuestion(question: string): Promise<string> {
    try {
      const result = await this.chain.invoke({
        question: question,
      });
      return result;
    } catch (error) {
      console.error('Erro ao processar a pergunta:', error);
      throw error;
    } finally {
      await closeVectorStore();
    }
  }
} 