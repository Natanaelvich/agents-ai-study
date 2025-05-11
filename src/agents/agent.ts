import { ChatOpenAI } from '@langchain/openai';
import { RedisChatMessageHistory } from '@langchain/redis';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getVectorStore, closeVectorStore } from '../db/vector-store';
import { createMessageHistory } from './config';

/**
 * AI Agent Implementation
 * 
 * This file implements a customer service agent that can:
 * 1. Maintain conversation context using Redis
 * 2. Search for relevant products using vector similarity
 * 3. Use tools to perform specific actions
 * 4. Generate contextualized responses
 */

// Tool for searching similar products
const searchProductsTool = new DynamicStructuredTool({
  name: "search_products",
  description: "Search for products similar to the user's query. Use this when the user asks about products, features, or prices.",
  schema: z.object({
    query: z.string().describe("The search query to find similar products"),
    limit: z.number().optional().describe("Maximum number of products to return (default: 3)")
  }),
  func: async ({ query, limit = 3 }) => {
    try {
      const vectorStore = await getVectorStore();
      const results = await vectorStore.similaritySearch(query, limit);
      return JSON.stringify(results, null, 2);
    } catch (error) {
      console.error('Error searching products:', error);
      return "Error searching for products";
    } finally {
      await closeVectorStore();
    }
  }
});

// System prompt that includes tool descriptions
const SYSTEM_PROMPT = `You are a helpful customer service agent for an e-commerce store.
You have access to the following tools:

1. search_products: Use this tool to find products similar to what the customer is asking about.
   - Input: A search query and optional limit
   - Use this when customers ask about products, features, or prices

When responding:
- Always use the search_products tool when customers ask about products
- Be friendly and professional
- If you don't find relevant products, politely inform the customer
- Don't make up information about products
- If you're unsure about something, ask for clarification`;

export class CustomerServiceAgent {
  private messageHistory: RedisChatMessageHistory;
  private model: ChatOpenAI;
  private chain: RunnableSequence;

  constructor(sessionId: string) {
    // Initialize message history for this session
    this.messageHistory = createMessageHistory(sessionId);
    
    // Initialize the LLM with tools
    this.model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      tools: [searchProductsTool],
    });

    /**
     * RunnableSequence.from creates a processing pipeline where each step's output
     * becomes the input for the next step:
     * 
     * 1. Format messages with history
     * 2. Process with LLM (which can use tools)
     * 3. Parse the response
     */
    this.chain = RunnableSequence.from([
      // Step 1: Format messages for the LLM
      async (input: { message: string }) => {
        const history = await this.messageHistory.getMessages();
        return [
          new SystemMessage(SYSTEM_PROMPT),
          ...history,
          new HumanMessage(input.message),
        ];
      },
      // Step 2: Process with LLM (which can use tools)
      this.model,
      // Step 3: Parse the response
      new StringOutputParser(),
    ]);
  }

  /**
   * Process a user message and generate a response
   * 
   * The agent will:
   * 1. Use tools to gather relevant information (e.g., search products)
   * 2. Generate a contextualized response
   * 3. Save the conversation history
   * 
   * @param message - The user's message
   * @returns The agent's response
   */
  async processMessage(message: string): Promise<string> {
    try {
      // Generate response using the chain
      const response = await this.chain.invoke({ message });

      // Save messages to history
      await this.messageHistory.addMessage(new HumanMessage(message));
      await this.messageHistory.addMessage(new AIMessage(response));

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Clear the conversation history for this session
   */
  async clearHistory(): Promise<void> {
    await this.messageHistory.clear();
  }
} 