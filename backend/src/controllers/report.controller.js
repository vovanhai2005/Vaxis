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

// report.controller.js
export const inventory = async (req, res) => {
  try {
   
    const { 
        search, 
        expiry_status, 
        min_quantity, 
        max_quantity, 
        from_date, 
        to_date, 
        page = 1, 
        limit = 10 
    } = req.query;
   
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    let whereClause = `WHERE 1=1`;
    
    if (search) {
      whereClause += ` AND (vl.lot_number ILIKE '%${search}%' OR v.code ILIKE '%${search}%' OR v.name ILIKE '%${search}%')`;
    }
   
    if (expiry_status === "sap_het") {
      whereClause += ` AND vl.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'`;
    } else if (expiry_status === "qua_han") {
      whereClause += ` AND vl.expiry_date < NOW()`;
    } else if (expiry_status === "con_han") {
      whereClause += ` AND vl.expiry_date > NOW() + INTERVAL '30 days'`;
    }
   
    if (min_quantity) {
        whereClause += ` AND vl.quantity >= ${parseInt(min_quantity)}`;
    }
    if (max_quantity) {
        whereClause += ` AND vl.quantity <= ${parseInt(max_quantity)}`;
    }
   
    if (from_date) {
        whereClause += ` AND vl.expiry_date >= '${from_date}'`;
    }
    if (to_date) {
        whereClause += ` AND vl.expiry_date <= '${to_date}'`;
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM vaccine_lots vl
      JOIN vaccines v ON vl.vaccine_id = v.id
      ${whereClause}
    `;
    
    const countResult = await sql.unsafe(countQuery);
    const totalItems = parseInt(countResult[0]?.total || 0);

    const dataQuery = `
      SELECT vl.id, v.code, v.name, vl.lot_number, vl.quantity, vl.expiry_date
      FROM vaccine_lots vl
      JOIN vaccines v ON vl.vaccine_id = v.id
      ${whereClause}
      ORDER BY vl.expiry_date ASC
      LIMIT ${limitNumber} OFFSET ${offset}
    `;
    
    const dataResult = await sql.unsafe(dataQuery);

    res.json({
      data: dataResult,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / limitNumber),
        totalItems: totalItems
      }
    });

  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Error retrieving inventory data" });
  }
};

// (thống kê sỗ mũi đã tiêm)
export const vaccinationStats = async (req, res) => {
  try {
    const { search, period, page = 1, limit = 10 } = req.query;
    
    // Xử lý phân trang
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    // 1. Xử lý Filter thời gian (cho số mũi ĐÃ TIÊM)
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
        dateFilter = ""; // Tất cả
    }

    // 2. Xử lý Search
    let searchFilter = "";
    if (search) {
      searchFilter = `AND (v.name ILIKE '%${search}%' OR v.code ILIKE '%${search}%')`;
    }

    // 3. Tính tổng số lượng bản ghi (để phân trang)
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM vaccines v
      WHERE 1=1 ${searchFilter}
    `;
    const countResult = await sql.unsafe(countQuery);
    const totalItems = parseInt(countResult[0]?.total || 0);

    // 4. Query lấy dữ liệu chính (có phân trang)
    const query = `
      SELECT
        v.id,
        v.code,
        v.name,
        COALESCE(SUM(a_count), 0)::int AS doses_given,
        COALESCE(SUM(l.quantity), 0)::int AS remaining
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
      LIMIT ${limitNumber} OFFSET ${offset}
    `;

    const result = await sql.unsafe(query);

    // 5. Trả về cấu trúc có pagination
    res.json({
        data: result,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalItems / limitNumber),
            totalItems: totalItems
        }
    });

  } catch (error) {
    console.error("Error fetching vaccination stats:", error);
    res.status(500).json({ error: "Error when retrieving vaccination statistics" });
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
