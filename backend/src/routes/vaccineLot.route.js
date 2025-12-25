import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { totalStock, expiringBatches, deleteLot, editLot, addLot, getLotById} from "../controllers/vaccineLot.controller.js";
import {  } from "../controllers/vaccineLot.controller.js";
const router = express.Router();

router.get("/expiring", protectRoute, expiringBatches);
router.get("/total-stock", protectRoute, totalStock);
router.post("/", protectRoute, addLot);
router.put("/delete/:id", protectRoute, deleteLot);
router.put("/:id", protectRoute, editLot);
router.get("/:id", protectRoute, getLotById);

export default router;
