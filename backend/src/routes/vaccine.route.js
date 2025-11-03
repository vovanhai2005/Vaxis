import { getVaccines, getVaccinesByID, addVaccine } from "../controllers/vaccine.controller.js";
import { protectRoute } from '../middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.get("/", protectRoute, getVaccines);
router.get("/:id", protectRoute, getVaccinesByID);
router.post("/", protectRoute, addVaccine);

export default router;