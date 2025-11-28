import { makeAppointment, getCitizenAppointments, totalCompleted, upcomingAppointments, editAppointment } from "../controllers/appointment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateAppointmentStatus } from "../controllers/appointment.controller.js";
import express from "express";

const router = express.Router();

router.post("/", protectRoute, makeAppointment);
router.get("/me", protectRoute, getCitizenAppointments);
router.get("/completed", protectRoute, totalCompleted);
router.get("/upcoming", protectRoute, upcomingAppointments);
router.put("/:id", protectRoute, editAppointment);
router.put("/:id/status", protectRoute, updateAppointmentStatus);

export default router;
