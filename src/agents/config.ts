import { ChatOpenAI } from '@langchain/openai';
import { RedisChatMessageHistory } from '@langchain/redis';
import redisClient from '../db/redis';

/**
 * LangChain Agent Configuration
 * 
 * This file sets up the core components for our AI agent:
 * 1. LLM (Large Language Model) - Using OpenAI's GPT model
 * 2. Memory - Using Redis for conversation history
 * 3. Tools - Custom tools the agent can use
 */

// Initialize the LLM (Language Model)
export const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo', // Using GPT-3.5 for cost-effectiveness
  temperature: 0.7, // Controls randomness: 0 = deterministic, 1 = creative
  streaming: true, // Enable streaming for real-time responses
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create a Redis-based message history store
 * This allows the agent to maintain context across conversations
 * 
 * @param sessionId - Unique identifier for the conversation
 * @returns RedisChatMessageHistory instance
 */
export const createMessageHistory = (sessionId: string) => {
  return new RedisChatMessageHistory({
    sessionId,
    client: redisClient,
  });
};

/**
 * System prompt that defines the agent's behavior and capabilities
 * This helps guide the model's responses and set boundaries
 */
export const SYSTEM_PROMPT = `You are an AI customer service agent for an e-commerce platform.
Your capabilities include:
- Answering questions about products and orders
- Processing simple orders
- Providing order status updates
- Handling basic customer service inquiries

Guidelines:
1. Always be polite and professional
2. If you're unsure about something, ask for clarification
3. If a request is too complex, initiate a handoff to a human agent
4. Keep responses concise but informative
5. Use the available tools to access real-time data when needed

Remember: Your goal is to provide efficient and helpful customer service while maintaining a friendly tone.`; 