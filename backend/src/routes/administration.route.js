import express from "express";
import {
  createAdministration,
  searchCitizensByNationalId,
} from "../controllers/administration.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createAdministration);
router.get("/", protectRoute, searchCitizensByNationalId);
export default router;
