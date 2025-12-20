import { getCitizenProfile, updateCitizenProfile, getVaccineHistory, getNotifications, getEmployeeProfile, updateEmployeeProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/me", protectRoute, getCitizenProfile);
router.get("/employee/me", protectRoute, getEmployeeProfile);
router.put("/me", protectRoute, updateCitizenProfile);
router.put("/employee/me", protectRoute, updateEmployeeProfile);
router.get("/me/vaccine-history", protectRoute, getVaccineHistory);
router.get("/me/notifications", protectRoute, getNotifications);
export default router;