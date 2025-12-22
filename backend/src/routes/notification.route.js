import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from "../controllers/notification.controller.js";

const router = express.Router();

// All routes require authentication
router.get("/", protectRoute, getUserNotifications);
router.get("/unread-count", protectRoute, getUnreadCount);
router.get("/stats", protectRoute, getNotificationStats);
router.put("/:id/read", protectRoute, markAsRead);
router.put("/read-all", protectRoute, markAllAsRead);
router.delete("/:id", protectRoute, deleteNotification);

export default router;
