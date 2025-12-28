import { makeAppointment, getCitizenAppointments, totalCompleted, upcomingAppointments, editAppointment, deleteAppointment, updateAppointmentStatus, completeAppointment } from "../controllers/appointment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/", protectRoute, makeAppointment);
router.get("/my-appointments", protectRoute, getCitizenAppointments);
router.get("/total-completed", protectRoute, totalCompleted);
router.get("/upcoming", protectRoute, upcomingAppointments);
router.put("/:id/complete", protectRoute, completeAppointment);
router.put("/:id/status", protectRoute, updateAppointmentStatus);
router.put("/:id", protectRoute, editAppointment);
router.delete("/:id", protectRoute, deleteAppointment);

export default router;
