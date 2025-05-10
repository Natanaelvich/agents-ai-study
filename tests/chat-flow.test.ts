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

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  user: '\x1b[34m', // Blue
  assistant: '\x1b[32m', // Green
  system: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  timestamp: '\x1b[90m', // Gray
};

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

  return response.json() as Promise<T>;
}

// Helper function to simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to log messages with timestamps and colors
function logMessage(role: string, content: string) {
  const timestamp = new Date().toISOString();
  const color = colors[role.toLowerCase() as keyof typeof colors] || colors.reset;
  
  console.log(`\n${colors.timestamp}[${timestamp}]${colors.reset} ${color}${role.toUpperCase()}:${colors.reset}`);
  console.log(`${color}${content}${colors.reset}`);
  console.log(`${colors.timestamp}${'-'.repeat(80)}${colors.reset}`);
}

/**
 * Main test function that simulates a user story
 */
async function runUserStory() {
  console.log('\n🚀 Iniciando Teste de Fluxo de Conversa');
  console.log('='.repeat(80));

  try {
    // 1. Saudação inicial e consulta de produto
    logMessage('User', 'Olá, estou interessado em comprar um novo notebook. Você pode me ajudar?');
    const response1 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Olá, estou interessado em comprar um novo notebook. Você pode me ajudar?',
    });
    
    if (!response1?.response?.content) {
      throw new Error('Formato de resposta inválido do endpoint de chat');
    }
    
    logMessage('Assistant', response1.response.content);

    // Aguarda um pouco para simular conversa real
    await delay(2000);

    // 2. Pergunta sobre produto específico
    logMessage('User', 'Quais notebooks vocês têm em estoque?');
    const response2 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Quais notebooks vocês têm em estoque?',
    });
    
    if (!response2?.response?.content) {
      throw new Error('Formato de resposta inválido do endpoint de chat');
    }
    
    logMessage('Assistant', response2.response.content);

    // Aguarda um pouco
    await delay(2000);

    // 3. Pergunta sobre preço
    logMessage('User', 'Quanto custa o MacBook Pro?');
    const response3 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Quanto custa o MacBook Pro?',
    });
    
    if (!response3?.response?.content) {
      throw new Error('Formato de resposta inválido do endpoint de chat');
    }
    
    logMessage('Assistant', response3.response.content);

    // Aguarda um pouco
    await delay(2000);

    // 4. Expressa interesse na compra
    logMessage('User', 'Gostaria de encomendar o MacBook Pro. Como posso prosseguir?');
    const response4 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Gostaria de encomendar o MacBook Pro. Como posso prosseguir?',
    });
    
    if (!response4?.response?.content) {
      throw new Error('Formato de resposta inválido do endpoint de chat');
    }
    
    logMessage('Assistant', response4.response.content);

    // Aguarda um pouco
    await delay(2000);

    // 5. Solicita assistência humana
    logMessage('User', 'Na verdade, tenho algumas dúvidas específicas sobre a garantia. Posso falar com um atendente?');
    const response5 = await makeRequest<ChatResponse>('/chat', 'POST', {
      sessionId: SESSION_ID,
      message: 'Na verdade, tenho algumas dúvidas específicas sobre a garantia. Posso falar com um atendente?',
    });
    
    if (!response5?.response?.content) {
      throw new Error('Formato de resposta inválido do endpoint de chat');
    }
    
    logMessage('Assistant', response5.response.content);

    // 6. Inicia transferência para humano
    const handoffResponse = await makeRequest<HandoffResponse>('/chat/handoff', 'POST', {
      sessionId: SESSION_ID,
      reason: 'Cliente tem dúvidas específicas sobre garantia',
    });
    logMessage('System', handoffResponse.message);

    // 7. Obtém histórico da conversa
    const history = await makeRequest<HistoryResponse>(`/chat/${SESSION_ID}`, 'GET');
    console.log('\n📜 Histórico da Conversa:');
    history.messages.forEach(msg => {
      const color = colors[msg.role as keyof typeof colors] || colors.reset;
      console.log(`${color}[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}${colors.reset}`);
    });

  } catch (error) {
    console.error(`\n${colors.error}❌ Erro durante o teste:${colors.reset}`, error);
    if (error instanceof Error) {
      console.error(`${colors.error}Detalhes do erro:${colors.reset}`, error.message);
      console.error(`${colors.error}Stack trace:${colors.reset}`, error.stack);
    }
  }

  console.log('\n✨ Teste de Fluxo de Conversa Concluído');
  console.log('='.repeat(80));
}

// Run the test
runUserStory().catch(console.error); 