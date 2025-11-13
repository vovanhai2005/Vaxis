import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { totalStock, expiringBatches, deleteLot, addLot} from "../controllers/vaccineLot.controller.js";
const router = express.Router();

router.get("/expiring", protectRoute, expiringBatches);
router.get("/stock", protectRoute, totalStock);
router.post("/", addLot);
router.delete("/:id", deleteLot);

export default router;
