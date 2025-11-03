import { sql } from "../config/db.js";

/**
 * GET /api/stats/vaccinations
 * Query params:
 *   - search: tìm kiếm theo code hoặc name
 *   - period: today | week | month | 6months
 */
export const vaccinationStats = async (req, res) => {
  try {
    const { search, period } = req.query;
    const params = [];

    // Build date filter
    let dateFilter = "";
    switch (period) {
      case "today":
        dateFilter = "AND a.administered_at::date = CURRENT_DATE";
        break;
      case "week":
        dateFilter = "AND a.administered_at >= date_trunc('week', CURRENT_DATE)";
        break;
      case "month":
        dateFilter = "AND a.administered_at >= date_trunc('month', CURRENT_DATE)";
        break;
      case "6months":
        dateFilter = "AND a.administered_at >= CURRENT_DATE - INTERVAL '6 months'";
        break;
      default:
        dateFilter = ""; // tất cả
    }

    // Build search filter
    let searchFilter = "";
    if (search) {
      
      searchFilter = `AND (v.name ILIKE '%${search}%' OR v.code ILIKE '%${search}%')`;
    }

    // Main query: thống kê doses_given và remaining
    const query = `
      SELECT
        v.id,
        v.code,
        v.name,
        COALESCE(SUM(a_count), 0) AS doses_given,
        COALESCE(SUM(l.quantity), 0) - COALESCE(SUM(a_count), 0) AS remaining
      FROM vaccines v
      LEFT JOIN vaccine_lots l ON l.vaccine_id = v.id
      LEFT JOIN (
        SELECT vaccine_id, COUNT(*) AS a_count
        FROM administrations a
        WHERE 1=1
        ${dateFilter}
        GROUP BY vaccine_id
      ) a ON a.vaccine_id = v.id
      WHERE 1=1
      ${searchFilter}
      GROUP BY v.id, v.code, v.name
      ORDER BY v.name ASC
    `;

    const result = await sql(query);
    res.json(result);

  } catch (error) {
    console.error("Error fetching vaccination stats:", error);
    res.status(500).json({ error: "Lỗi khi lấy thống kê tiêm chủng" });
  }
};