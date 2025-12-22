import express from "express";
import { protectRoute, managerOnly } from "../middleware/auth.middleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";

const router = express.Router();

// All authenticated users can view announcements
router.get("/", protectRoute, getAnnouncements);
router.get("/:id", protectRoute, getAnnouncementById);

// Only managers can create, update, and delete announcements
router.post("/", protectRoute, managerOnly, createAnnouncement);
router.put("/:id", protectRoute, managerOnly, updateAnnouncement);
router.delete("/:id", protectRoute, managerOnly, deleteAnnouncement);

export default router;
