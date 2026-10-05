import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/google', AuthController.googleLogin);
router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
