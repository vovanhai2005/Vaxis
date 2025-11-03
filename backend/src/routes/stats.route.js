import express from "express";
import { vaccinationStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/vaccinations", vaccinationStats);

export default router;