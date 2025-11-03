import express from "express";
import { inventory, addLot, deleteLot } from "../controllers/inventory.controller.js";

const router = express.Router();

// Lấy danh sách tồn kho (có thể lọc theo hạn, lô)
router.get("/", inventory);

// Thêm lô vaccine mới
router.post("/", addLot);

// Xóa lô vaccine
router.delete("/:id", deleteLot);

export default router;
