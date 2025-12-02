import { makeAppointment, getCitizenAppointments, totalCompleted, upcomingAppointments, editAppointment, deleteAppointment, updateAppointmentStatus } from "../controllers/appointment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/", protectRoute, makeAppointment);
router.get("/me", protectRoute, getCitizenAppointments);
router.get("/completed", protectRoute, totalCompleted);
router.get("/upcoming", protectRoute, upcomingAppointments);
router.put("/:id", protectRoute, editAppointment);
router.delete("/:id", protectRoute, deleteAppointment);
router.put("/:id/status", protectRoute, updateAppointmentStatus);

export default router;
