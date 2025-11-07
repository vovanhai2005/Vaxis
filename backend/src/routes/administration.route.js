import express from 'express';
import { createAdministration, getAdministrationHistory } from '../controllers/administration.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createAdministration);
router.get('/history/:citizenId', protectRoute, getAdministrationHistory);

export default router;