import express from "express";
import { getVaccineNews } from "../controllers/news.controller.js";

const router = express.Router();

// GET /api/news - Fetch vaccine news
router.get("/", getVaccineNews);

export default router;
