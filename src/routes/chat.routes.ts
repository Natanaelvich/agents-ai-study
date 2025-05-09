import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

// POST /chat - Enviar mensagem e receber resposta
router.post('/', async (req, res) => {
  await chatController.sendMessage(req, res);
});

// POST /chat/handoff - Transferir conversa para humano
router.post('/handoff', async (req, res) => {
  await chatController.handoffToHuman(req, res);
});

// GET /chat/:sessionId - Obter histórico de mensagens
router.get('/:sessionId', async (req, res) => {
  await chatController.getSessionHistory(req, res);
});

export default router; 