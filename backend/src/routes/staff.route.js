import {
  createEmployee,
  getStaffList,
  deleteEmployee,
  updateEmployeeProfile,
} from "../controllers/staff.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", protectRoute, createEmployee);
router.get("/list", protectRoute, getStaffList);
router.put("/update/:id", protectRoute, updateEmployeeProfile);
router.put("/delete/:id", protectRoute, deleteEmployee);

export default router;
