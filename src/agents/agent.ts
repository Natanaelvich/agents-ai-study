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
    
    /**
     * RunnableSequence.from creates a processing pipeline where each step's output
     * becomes the input for the next step. It's like a conveyor belt for data:
     * 
     * Input -> Step 1 -> Step 2 -> Step 3 -> Output
     * 
     * In our case:
     * 1. First step: Format messages (input: {message} -> output: Message[])
     * 2. Second step: Process with LLM (input: Message[] -> output: LLMResponse)
     * 3. Third step: Parse response (input: LLMResponse -> output: string)
     */
    this.chain = RunnableSequence.from([
      // Step 1: Format messages for the LLM
      async (input: { message: string }) => {
        // Get conversation history
        const history = await this.messageHistory.getMessages();
        
        // Format messages for the LLM
        return [
          new SystemMessage(SYSTEM_PROMPT),
          ...history,
          new HumanMessage(input.message),
        ];
      },
      // Step 2: Process with LLM
      llm,
      // Step 3: Parse the response
      /**
       * StringOutputParser converts the LLM's response into a plain string.
       * This is necessary because LangChain's LLM responses can be complex objects,
       * but we just want the text content for our chat interface.
       */
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
      /**
       * addMessage stores messages in Redis for conversation history.
       * We save both:
       * 1. The user's message (HumanMessage)
       * 2. The AI's response (AIMessage)
       * 
       * This allows the agent to maintain context across multiple interactions
       * and reference previous parts of the conversation.
       */
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