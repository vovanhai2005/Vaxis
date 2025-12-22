import { sql } from "../config/db.js";

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_read, limit = 20, offset = 0 } = req.query;

    let query = sql`
      SELECT *
      FROM notifications
      WHERE user_id = ${userId}
    `;

    if (is_read !== undefined) {
      query = sql`${query} AND is_read = ${is_read === 'true'}`;
    }

    query = sql`${query}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const notifications = await query;

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

    const result = await sql`
      SELECT COUNT(*)::int as unread_count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;

    res.status(200).json({ unread_count: result[0].unread_count });
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

    await sql`
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES (
        ${citizen[0].user_id},
        'appointment',
        'Appointment Completed',
        ${`Your vaccination appointment has been completed successfully. You can now download your certificate.`},
        ${appointmentData.appointmentId}
      )
    `;
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
      await Promise.all(
        employees.map(employee =>
          sql`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (
              ${employee.id},
              'task',
              'Daily Task Reminder',
              ${`You have ${count} appointment${count > 1 ? 's' : ''} scheduled for today. Please check your upcoming appointments.`}
            )
          `
        )
      );
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
