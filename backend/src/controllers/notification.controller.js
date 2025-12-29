import { sql } from "../config/db.js";
import { getCache, setCache, deleteCache, cacheKeys } from "../lib/cache.js";
import { emitNotificationToUser } from "../lib/socket.js";

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_read, limit = 20, offset = 0 } = req.query;

    // Only cache first page with no filters
    const shouldCache = is_read === undefined && offset == 0 && limit == 20;
    const cacheKey = shouldCache ? cacheKeys.notifications(userId, limit) : null;

    if (cacheKey) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }
    }

    let notifications;

    if (is_read !== undefined) {
      const isReadBool = is_read === 'true';
      notifications = await sql`
        SELECT *
        FROM notifications
        WHERE user_id = ${userId} AND is_read = ${isReadBool}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
    } else {
      notifications = await sql`
        SELECT *
        FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
    }

    // Cache for 2 minutes
    if (cacheKey) {
      await setCache(cacheKey, notifications, 120);
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheKeys.unreadCount(userId);

    // Try to get from cache first
    const cached = await getCache(cacheKey);
    if (cached !== null) {
      return res.status(200).json({ unread_count: cached });
    }

    const result = await sql`
      SELECT COUNT(*)::int as unread_count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;

    const unreadCount = result && result.length > 0 ? result[0].unread_count : 0;
    
    // Cache for 1 minute
    await setCache(cacheKey, unreadCount, 60);
    
    res.status(200).json({ unread_count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (notification.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Invalidate cache
    await deleteCache(cacheKeys.unreadCount(userId));
    await deleteCache(cacheKeys.notifications(userId, 20));

    // Emit socket event
    emitNotificationToUser(userId, "notification:read", {
      notificationId: id,
      notification: notification[0]
    });

    res.status(200).json({ 
      message: "Notification marked as read",
      notification: notification[0]
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `;

    // Invalidate cache
    await deleteCache(cacheKeys.unreadCount(userId));
    await deleteCache(cacheKeys.notifications(userId, 20));

    // Emit socket event
    emitNotificationToUser(userId, "notification:readAll", {});

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Invalidate cache
    await deleteCache(cacheKeys.unreadCount(userId));
    await deleteCache(cacheKeys.notifications(userId, 20));

    // Emit socket event
    emitNotificationToUser(userId, "notification:deleted", { notificationId: id });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create notification for appointment completion (System use)
export const createAppointmentNotification = async (citizenId, appointmentData) => {
  try {
    const citizen = await sql`
      SELECT user_id FROM citizens WHERE id = ${citizenId}
    `;

    if (citizen.length === 0) return;

    const notification = await sql`
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES (
        ${citizen[0].user_id},
        'appointment',
        'Appointment Completed',
        ${`Your vaccination appointment has been completed successfully. You can now download your certificate.`},
        ${appointmentData.appointmentId}
      )
      RETURNING *
    `;

    // Emit socket event for real-time notification
    if (notification.length > 0) {
      emitNotificationToUser(citizen[0].user_id, "notification:new", notification[0]);
      // Invalidate cache
      await deleteCache(cacheKeys.unreadCount(citizen[0].user_id));
      await deleteCache(cacheKeys.notifications(citizen[0].user_id, 20));
    }
  } catch (error) {
    console.error("Error creating appointment notification:", error);
  }
};

// Create daily task notification for employees (System use)
export const createDailyTaskNotification = async () => {
  try {
    // Get all employees
    const employees = await sql`
      SELECT id FROM users WHERE role = 'employee'
    `;

    // Get today's appointments count for notification
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsCount = await sql`
      SELECT COUNT(*)::int as count
      FROM appointments
      WHERE scheduled_at >= ${today.toISOString()} 
        AND scheduled_at < ${tomorrow.toISOString()}
        AND status != 'cancelled'
        AND status != 'completed'
    `;

    const count = appointmentsCount[0].count;

    if (count > 0 && employees.length > 0) {
      const notificationPromises = employees.map(async (employee) => {
        const notification = await sql`
          INSERT INTO notifications (user_id, type, title, message)
          VALUES (
            ${employee.id},
            'task',
            'Daily Task Reminder',
            ${`You have ${count} appointment${count > 1 ? 's' : ''} scheduled for today. Please check your upcoming appointments.`}
          )
          RETURNING *
        `;
        
        // Emit socket event for each employee
        if (notification.length > 0) {
          emitNotificationToUser(employee.id, "notification:new", notification[0]);
          // Invalidate cache
          await deleteCache(cacheKeys.unreadCount(employee.id));
          await deleteCache(cacheKeys.notifications(employee.id, 20));
        }
      });
      
      await Promise.all(notificationPromises);
    }
  } catch (error) {
    console.error("Error creating daily task notifications:", error);
  }
};

// Get notification statistics (for dashboard)
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await sql`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN is_read = false THEN 1 END)::int as unread,
        COUNT(CASE WHEN type = 'appointment' THEN 1 END)::int as appointments,
        COUNT(CASE WHEN type = 'task' THEN 1 END)::int as tasks,
        COUNT(CASE WHEN type = 'announcement' THEN 1 END)::int as announcements
      FROM notifications
      WHERE user_id = ${userId}
    `;

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
