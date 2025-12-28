import { sql } from "../config/db.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../lib/cache.js";

// Create announcement (Manager only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_audience, priority, expires_at } = req.body;
    const managerId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const announcement = await sql`
      INSERT INTO announcements (title, content, target_audience, created_by, priority, expires_at)
      VALUES (${title}, ${content}, ${target_audience || 'all'}, ${managerId}, ${priority || 0}, ${expires_at || null})
      RETURNING *
    `;

    // Create notifications for target users
    let targetUsers = [];
    
    if (target_audience === 'all') {
      targetUsers = await sql`SELECT id FROM users`;
    } else if (target_audience === 'citizens') {
      targetUsers = await sql`SELECT id FROM users WHERE role = 'citizen'`;
    } else if (target_audience === 'employees') {
      targetUsers = await sql`SELECT id FROM users WHERE role = 'employee'`;
    } else if (target_audience === 'managers') {
      targetUsers = await sql`SELECT id FROM users WHERE role = 'manager'`;
    }

    // Create notification for each target user
    if (targetUsers.length > 0) {
      await Promise.all(
        targetUsers.map(user => 
          sql`
            INSERT INTO notifications (user_id, type, title, message, related_id)
            VALUES (${user.id}, 'announcement', ${title}, ${content}, ${announcement[0].id})
          `
        )
      );
    }

    // Invalidate announcements cache for all roles
    await deleteCachePattern('announcements:*');
    
    res.status(201).json({ 
      message: `Announcement created successfully and sent to ${targetUsers.length} user(s)`,
      announcement: announcement[0],
      notificationsSent: targetUsers.length
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all announcements (with filters)
export const getAnnouncements = async (req, res) => {
  try {
    const { is_active, target_audience, limit = 5, offset = 0 } = req.query;
    const userRole = req.user.role;

    // Cache only first page with no filters
    const shouldCache = offset == 0 && limit == 5 && !is_active && !target_audience;
    const cacheKey = shouldCache ? `announcements:${userRole}` : null;

    if (cacheKey) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }
    }

    let announcements;

    // Build query based on user role
    if (userRole === 'citizen') {
      if (is_active !== undefined) {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE (a.target_audience = 'all' OR a.target_audience = 'citizens')
            AND a.is_active = ${is_active === 'true'}
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      } else {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE (a.target_audience = 'all' OR a.target_audience = 'citizens')
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      }
    } else if (userRole === 'employee') {
      if (is_active !== undefined) {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE (a.target_audience = 'all' OR a.target_audience = 'employees')
            AND a.is_active = ${is_active === 'true'}
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      } else {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE (a.target_audience = 'all' OR a.target_audience = 'employees')
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      }
    } else if (userRole === 'manager') {
      // Managers can see all announcements
      if (target_audience && is_active !== undefined) {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.target_audience = ${target_audience}
            AND a.is_active = ${is_active === 'true'}
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      } else if (target_audience) {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.target_audience = ${target_audience}
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      } else if (is_active !== undefined) {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.is_active = ${is_active === 'true'}
            AND (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      } else {
        announcements = await sql`
          SELECT a.*, u.full_name as creator_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE (a.expires_at IS NULL OR a.expires_at > NOW())
          ORDER BY a.priority DESC, a.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
      }
    }

    // Cache for 3 minutes
    if (cacheKey) {
      await setCache(cacheKey, announcements, 180);
    }

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await sql`
      SELECT a.*, u.full_name as creator_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ${id}
    `;

    if (announcement.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement[0]);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update announcement (Manager only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_audience, is_active, priority, expires_at } = req.body;

    const announcement = await sql`
      UPDATE announcements
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        target_audience = COALESCE(${target_audience}, target_audience),
        is_active = COALESCE(${is_active}, is_active),
        priority = COALESCE(${priority}, priority),
        expires_at = COALESCE(${expires_at}, expires_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (announcement.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement: announcement[0]
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete announcement (Manager only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM announcements
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Delete related notifications
    await sql`
      DELETE FROM notifications
      WHERE type = 'announcement' AND related_id = ${id}
    `;

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
