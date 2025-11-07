import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { totalStock, expiringBatches, deleteLot, addLot} from "../controllers/vaccineLot.controller.js";
import {  } from "../controllers/vaccineLot.controller.js";
const router = express.Router();

router.post("/", addLot);
router.delete("/:id", deleteLot);
router.get("/stock", protectRoute, totalStock);
router.get("/expiring", protectRoute, expiringBatches);
export default router;
