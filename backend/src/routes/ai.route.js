import express from 'express';
import { chatWithAI } from '../controllers/ai.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/chat', protectRoute, chatWithAI);

export default router;
