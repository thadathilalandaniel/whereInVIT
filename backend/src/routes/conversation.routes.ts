import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All conversation routes require authentication
router.use(requireAuth);

router.get('/', ConversationController.getConversations);
router.get('/:id', ConversationController.getConversation);
router.get('/:id/messages', ConversationController.getMessages);
router.post('/:id/messages', ConversationController.sendMessage);
router.patch('/:id/read', ConversationController.markAsRead);

export default router;
