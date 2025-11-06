import { sql } from '../config/db.js';

   // Số mũi tiêm completed, booked (biểu đồ tròn) (dashboard admin)
export const vaccinationRate = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }

    const result = await sql`
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS da_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at >= NOW() THEN 1 ELSE 0 END)::int AS chua_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at < NOW() THEN 1 ELSE 0 END)::int AS qua_han
      FROM appointments
    `;

    const row = (result && result[0]) ? result[0] : { da_tiem: 0, chua_tiem: 0, qua_han: 0 };

    res.status(200).json({
      da_tiem: Number(row.da_tiem) || 0,
      chua_tiem: Number(row.chua_tiem) || 0,
      qua_han: Number(row.qua_han) || 0,
    });
  } catch (error) {
    console.error('Error fetching vaccination rate:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Số mũi tháng này (biểu đồ cột) (dashboard admin)
export const monthlyStats = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }

    const result = await sql`
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS da_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at >= NOW() THEN 1 ELSE 0 END)::int AS chua_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at < NOW() THEN 1 ELSE 0 END)::int AS qua_han
      FROM appointments
      WHERE DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', NOW())
    `;

   
    const row = (result && result[0]) ? result[0] : { da_tiem: 0, chua_tiem: 0, qua_han: 0 };

    res.status(200).json({
      da_tiem: Number(row.da_tiem) || 0,
      chua_tiem: Number(row.chua_tiem) || 0,
      qua_han: Number(row.qua_han) || 0,
    });
  } catch (error) {
    console.error('Error fetching monthly vaccination stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Lấy danh sách vaccine + lô (báo cáo tồn kho)
export const inventory = async (req, res) => {
  try {
    const { search, expiry_status } = req.query;


    let queryText = `
      SELECT vl.id, v.code, v.name, vl.lot_number, vl.quantity, vl.expiry_date
      FROM vaccine_lots vl
      JOIN vaccines v ON vl.vaccine_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (vl.lot_number ILIKE '%${search}%' OR v.code ILIKE '%${search}%' OR v.name ILIKE '%${search}%')`;
      //searchFilter = `AND (v.name ILIKE '%${search}%' OR v.code ILIKE '%${search}%')`;
    }

    if (expiry_status === "sap_het") {
      queryText += ` AND vl.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'`;
    } else if (expiry_status === "qua_han") {
      queryText += ` AND vl.expiry_date < NOW()`;
    } else if (expiry_status === "con_han") {
      queryText += ` AND vl.expiry_date > NOW() + INTERVAL '30 days'`;
    }

    queryText += ` ORDER BY vl.expiry_date ASC`;

    const result = await sql(queryText);
    res.json(result);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu tồn kho" });
  }
};

// (thống kê sỗ mũi đã tiêm)
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

//  Tổng công dân
export const totalCitizens = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }
     
    const result = await sql`
  SELECT COUNT(*)
  FROM users
  WHERE role = 'citizen'
`;

    const totalCitizens = result[0]?.count ?? 0;
    res.status(200).json({ totalCitizens });
  } catch (error) {
    console.error('Error fetching total completed vaccinations:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};