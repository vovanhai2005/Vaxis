import express from "express";
import {
  createAdministration,
  searchCitizensByNationalId,
  getBillDetails,
  updateBillStatus,
} from "../controllers/administration.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/:appointmentId", protectRoute, createAdministration);
router.get("/", protectRoute, searchCitizensByNationalId);
router.get("/:appointmentId/bill", protectRoute, getBillDetails);
router.put("/:appointmentId/bill", protectRoute, updateBillStatus);
export default router;
