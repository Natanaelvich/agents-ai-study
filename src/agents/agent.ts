import { ChatOpenAI } from '@langchain/openai';
import { RedisChatMessageHistory } from '@langchain/redis';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { llm, createMessageHistory, SYSTEM_PROMPT } from './config';

/**
 * AI Agent Implementation
 * 
 * This file implements the core agent logic using LangChain's components:
 * 1. Message History - Maintains conversation context using Redis
 * 2. Chain - Combines the LLM with memory and tools
 * 3. Message Processing - Handles message formatting and response generation
 */

export class CustomerServiceAgent {
  private messageHistory: RedisChatMessageHistory;
  private chain: RunnableSequence;

  constructor(sessionId: string) {
    // Initialize message history for this session
    this.messageHistory = createMessageHistory(sessionId);
    
    // Create the processing chain
    this.chain = RunnableSequence.from([
      // Format messages for the LLM
      {
        messages: async (input: { message: string }) => {
          // Get conversation history
          const history = await this.messageHistory.getMessages();
          
          // Format messages for the LLM
          const messages = [
            new SystemMessage(SYSTEM_PROMPT),
            ...history,
            new HumanMessage(input.message),
          ];

          return messages;
        },
      },
      // Process with LLM
      llm,
      // Parse the response
      new StringOutputParser(),
    ]);
  }

  /**
   * Process a user message and generate a response
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