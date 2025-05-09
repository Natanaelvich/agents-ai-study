import { Router } from 'express';
import chatRoutes from './chat.routes';

const router = Router();

// Import route modules here
// Example: import userRoutes from './user.routes';

// Register routes here
// Example: router.use('/users', userRoutes);

// Chat routes
router.use('/chat', chatRoutes);

export default router; 