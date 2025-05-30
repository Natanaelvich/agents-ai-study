import { Request, Response } from 'express';
import { db } from '../db';
import { messages } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CustomerServiceAgent } from '../agents/agent';

// Store active agent instances
const activeAgents = new Map<string, CustomerServiceAgent>();

export const chatController = {
  // Enviar mensagem e receber resposta
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({
          error: 'Message and sessionId are required',
        });
      }

      // Get or create agent instance for this session
      let agent = activeAgents.get(sessionId);
      if (!agent) {
        agent = new CustomerServiceAgent(sessionId);
        activeAgents.set(sessionId, agent);
      }

      // Process message with AI agent
      const response = await agent.processMessage(message);

      // Salvar mensagem no banco
      const [savedMessage] = await db
        .insert(messages)
        .values({
          sessionId,
          content: message,
          role: 'user',
          timestamp: new Date(),
        })
        .returning();

      // Salvar resposta no banco
      const [savedResponse] = await db
        .insert(messages)
        .values({
          sessionId,
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        })
        .returning();

      return res.status(200).json({
        message: savedMessage,
        response: savedResponse,
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },

  // Transferir conversa para humano
  async handoffToHuman(req: Request, res: Response) {
    try {
      const { sessionId, reason } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: 'SessionId is required',
        });
      }

      // Clear agent instance for this session
      const agent = activeAgents.get(sessionId);
      if (agent) {
        await agent.clearHistory();
        activeAgents.delete(sessionId);
      }

      const handoffResponse = {
        status: 'handoff_initiated',
        message: 'Your conversation will be transferred to a human agent.',
        reason: reason || 'User requested human assistance',
        estimatedWaitTime: '5-10 minutes',
      };

      // Salvar evento de handoff no banco
      const [handoffEvent] = await db
        .insert(messages)
        .values({
          sessionId,
          content: JSON.stringify(handoffResponse),
          role: 'system',
          timestamp: new Date(),
        })
        .returning();

      return res.status(200).json({
        ...handoffResponse,
        event: handoffEvent,
      });
    } catch (error) {
      console.error('Error in handoffToHuman:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },

  // Obter histórico de mensagens de uma sessão
  async getSessionHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'SessionId is required',
        });
      }

      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(messages.timestamp);

      return res.status(200).json({
        sessionId,
        messages: sessionMessages,
      });
    } catch (error) {
      console.error('Error in getSessionHistory:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
}; 