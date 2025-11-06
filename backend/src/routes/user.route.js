import { getCitizenProfile, updateCitizenProfile, getVaccineHistory, getNotifications } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/me", protectRoute, getCitizenProfile);
router.put("/me", protectRoute, updateCitizenProfile);
router.get("/me/vaccine-history", protectRoute, getVaccineHistory);
router.get("/me/notifications", protectRoute, getNotifications);
export default router;