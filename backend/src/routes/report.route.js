import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { vaccinationRate, monthlyStats, inventory, vaccinationStats, totalCitizens, vaccinationStatsLimit10 } from "../controllers/report.controller.js";
const router = express.Router(); 


router.get("/appointments-vaccination-stats", protectRoute, vaccinationRate);
router.get("/appointments-vaccination-monthly-stats", protectRoute, monthlyStats);
router.get("/vaccinations", protectRoute, vaccinationStats); // thống kê mũi tiêm
router.get("/inventory", protectRoute, inventory);// Lấy danh sách tồn kho (có thể lọc theo hạn, lô)
router.get("/total-citizens", protectRoute, totalCitizens);// lấy số công dân dùng ứng dụng
router.get("/vaccinations-limit-10", protectRoute, vaccinationStatsLimit10);// thống kê mũi tiêm (limit 10)
export default router;
