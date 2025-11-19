import { makeAppointment, getCitizenAppointments, totalCompleted, upcomingAppointments } from "../controllers/appointment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/", protectRoute, makeAppointment);
router.get("/me", protectRoute, getCitizenAppointments);
router.get("/completed", protectRoute, totalCompleted);
router.get("/upcoming", protectRoute, upcomingAppointments);
export default router;
