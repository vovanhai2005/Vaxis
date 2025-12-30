import { getVaccines, getVaccinesByID, addVaccine, editVaccine, deleteVaccine } from "../controllers/vaccine.controller.js";
import { protectRoute } from '../middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.get("/", protectRoute, getVaccines);
router.get("/:id", protectRoute, getVaccinesByID);
router.post("/", protectRoute, addVaccine);
router.put("/:id", protectRoute, editVaccine);
router.put("/delete/:id", protectRoute, deleteVaccine);

export default router;