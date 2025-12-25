import { getVaccines, getVaccinesByID, addVaccine, editVaccine, deleteVaccine, restoreVaccine } from "../controllers/vaccine.controller.js";
import { protectRoute } from '../middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.get("/", protectRoute, getVaccines);
router.get("/:id", protectRoute, getVaccinesByID);
router.post("/", protectRoute, addVaccine);
router.put("/:id", protectRoute, editVaccine);
router.put("/delete/:id", protectRoute, deleteVaccine);
router.put('/restore/:id', protectRoute, restoreVaccine);
export default router;