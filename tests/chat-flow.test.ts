// Remove the node-fetch import since we're using native fetch

/**
 * Test Suite: Chat Flow Simulation
 * 
 * This test simulates a real user interaction with our AI customer service agent.
 * It follows a typical user story of a customer trying to place an order and getting help.
 */

// Type definitions for API responses
interface ChatMessage {
  id: number;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: any;
}

interface ChatResponse {
  message: ChatMessage;
  response: ChatMessage;
}

interface HandoffResponse {
  status: string;
  message: string;
  reason: string;
  estimatedWaitTime: string;
  event: ChatMessage;
}

interface HistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
}

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const SESSION_ID = 'test-session-' + Date.now();

// Helper function to make API calls
async function makeRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json();
  console.log(`\n🔍 API Response from ${endpoint}:`, JSON.stringify(data, null, 2));
  return data as T;
}

// Helper function to simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to log messages with timestamps
function logMessage(role: string, content: string) {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${role.toUpperCase()}:`);
  console.log(content);
  console.log('-'.repeat(80));
}

/**
 * Main test function that simulates a user story
 */
async function runUserStory() {
  console.log('\n🚀 Starting User Story Test');
  console.log('='.repeat(80));

  try {
    // 1. Initial greeting and product inquiry
    logMessage('User', 'Hi, I\'m interested in buying a new laptop. Can you help me?');
    const response1 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Hi, I\'m interested in buying a new laptop. Can you help me?',
    });
    
    if (!response1?.response?.content) {
      throw new Error('Invalid response format from chat endpoint');
    }
    
    logMessage('Assistant', response1.response.content);

    // Wait a bit to simulate real conversation
    await delay(2000);

    // 2. Ask about specific product
    logMessage('User', 'What laptops do you have in stock?');
    const response2 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'What laptops do you have in stock?',
    });
    
    if (!response2?.response?.content) {
      throw new Error('Invalid response format from chat endpoint');
    }
    
    logMessage('Assistant', response2.response.content);

    // Wait a bit
    await delay(2000);

    // 3. Ask about pricing
    logMessage('User', 'How much does the MacBook Pro cost?');
    const response3 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'How much does the MacBook Pro cost?',
    });
    
    if (!response3?.response?.content) {
      throw new Error('Invalid response format from chat endpoint');
    }
    
    logMessage('Assistant', response3.response.content);

    // Wait a bit
    await delay(2000);

    // 4. Express interest in purchase
    logMessage('User', 'I\'d like to order the MacBook Pro. How do I proceed?');
    const response4 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'I\'d like to order the MacBook Pro. How do I proceed?',
    });
    
    if (!response4?.response?.content) {
      throw new Error('Invalid response format from chat endpoint');
    }
    
    logMessage('Assistant', response4.response.content);

    // Wait a bit
    await delay(2000);

    // 5. Request human assistance
    logMessage('User', 'Actually, I have some specific questions about the warranty. Can I talk to a human?');
    const response5 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Actually, I have some specific questions about the warranty. Can I talk to a human?',
    });
    
    if (!response5?.response?.content) {
      throw new Error('Invalid response format from chat endpoint');
    }
    
    logMessage('Assistant', response5.response.content);

    // 6. Initiate handoff
    const handoffResponse = await makeRequest<HandoffResponse>('/chat/handoff', 'POST', {
      sessionId: SESSION_ID,
      reason: 'Customer has specific warranty questions',
    });
    logMessage('System', JSON.stringify(handoffResponse, null, 2));

    // 7. Get conversation history
    const history = await makeRequest<HistoryResponse>(`/chat/${SESSION_ID}`, 'GET');
    console.log('\n📜 Conversation History:');
    console.log(JSON.stringify(history, null, 2));

  } catch (error) {
    console.error('\n❌ Error during test:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }

  console.log('\n✨ User Story Test Completed');
  console.log('='.repeat(80));
}

// Run the test
runUserStory().catch(console.error); 