import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

// route cho admin dashboard
router.get("/admin", protectRoute, getAdminDashboard);

export default router;
