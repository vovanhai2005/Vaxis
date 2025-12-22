import express from "express";
import {
  createAdministration,
  searchCitizensByNationalId,
  getBillDetails,
  updateBillStatus,
} from "../controllers/administration.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", protectRoute, searchCitizensByNationalId);
router.get("/:appointmentId/bill", protectRoute, getBillDetails);
router.put("/:appointmentId/bill", protectRoute, updateBillStatus);
router.put("/:appointmentId", protectRoute, createAdministration);

export default router;
