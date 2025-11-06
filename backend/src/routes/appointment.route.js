import { makeAppointment } from "../controllers/appointment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { totalCompleted } from "../controllers/appointment.controller.js";
import express from "express";

const router = express.Router();

router.post("/", protectRoute, makeAppointment);
router.get("/completed", protectRoute, totalCompleted);

export default router;