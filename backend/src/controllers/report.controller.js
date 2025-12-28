import { sql } from '../config/db.js';
import { getCache, setCache, cacheKeys } from '../lib/cache.js';

// Số mũi tiêm completed, booked (biểu đồ tròn) (dashboard admin)
export const vaccinationRate = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }

    const cacheKey = cacheKeys.stats('vaccination_rate');
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const result = await sql`
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS da_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at >= NOW() THEN 1 ELSE 0 END)::int AS chua_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at < NOW() THEN 1 ELSE 0 END)::int AS qua_han
      FROM appointments
    `;

    const row = (result && result[0]) ? result[0] : { da_tiem: 0, chua_tiem: 0, qua_han: 0 };

    const stats = {
      da_tiem: Number(row.da_tiem) || 0,
      chua_tiem: Number(row.chua_tiem) || 0,
      qua_han: Number(row.qua_han) || 0,
    };

    // Cache for 2 minutes
    await setCache(cacheKey, stats, 120);

    res.status(200).json(stats);
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

    const cacheKey = cacheKeys.stats('monthly_stats');
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
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

    const stats = {
      da_tiem: Number(row.da_tiem) || 0,
      chua_tiem: Number(row.chua_tiem) || 0,
      qua_han: Number(row.qua_han) || 0,
    };

    // Cache for 5 minutes
    await setCache(cacheKey, stats, 300);

    res.status(200).json(stats);
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

    let whereClause = `WHERE v.active = TRUE AND vl.active = TRUE`;
    const today = "(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE"; 

    if (search) {
      whereClause += ` AND (vl.lot_number ILIKE '%${search}%' OR v.code ILIKE '%${search}%' OR v.name ILIKE '%${search}%')`;
    }
    
    if (expiry_status === "sap_het") {
      // Sửa: Dùng >= CURRENT_DATE để lấy cả ngày hôm nay
      whereClause += ` AND vl.expiry_date >= ${today} AND vl.expiry_date <= ${today} + INTERVAL '30 days'`;
    } else if (expiry_status === "qua_han") {
      // Sửa: Nhỏ hơn hẵn ngày hôm nay (tức là từ hôm qua trở về trước)
      whereClause += ` AND vl.expiry_date < ${today}`;
    } else if (expiry_status === "con_han") {
      // Sửa: Lớn hơn 30 ngày tới
      whereClause += ` AND vl.expiry_date > ${today} + INTERVAL '30 days'`;
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

    // 4. Query lấy dữ liệu chính
  const query = `
  SELECT
    v.id,
    v.code,
    v.name,
    
    -- 1. TỔNG SỐ MŨI ĐÃ TIÊM (Lịch sử tiêm chủng)
    -- Vẫn đếm tất cả, kể cả các mũi thuộc lô đã hết hạn (vì mũi đó đã tiêm vào người rồi)
    COALESCE(stats.total_doses, 0)::int AS doses_given,

    -- 2. SỐ LƯỢNG CÒN LẠI (Tồn kho khả dụng)
    -- Chỉ tính tổng tồn kho của các LÔ CÒN HẠN
    COALESCE(stock.available_qty, 0)::int AS remaining

  FROM vaccines v
  
  -- Subquery 1: Tính tổng số mũi đã tiêm (để hiển thị báo cáo hoạt động)
  LEFT JOIN (
    SELECT 
        vaccine_id, 
        COUNT(*) AS total_doses
    FROM administrations
    WHERE 1=1
    ${dateFilter} -- Bộ lọc ngày chỉ áp dụng cho báo cáo "đã tiêm"
    GROUP BY vaccine_id
  ) stats ON stats.vaccine_id = v.id

  -- Subquery 2: Tính tồn kho thực tế dựa trên các Lô còn hạn
  LEFT JOIN (
    SELECT
        l.vaccine_id,
        -- Công thức: Tổng (Số lượng nhập của lô - Số lượng đã dùng của lô đó)
        SUM(l.quantity - COALESCE(usage.used_count, 0)) AS available_qty
    FROM vaccine_lots l
    -- Join để đếm số lượng đã dùng CỦA RIÊNG LÔ ĐÓ
    LEFT JOIN (
        SELECT vaccine_lot_id, COUNT(*) as used_count
        FROM administrations
        GROUP BY vaccine_lot_id
    ) usage ON usage.vaccine_lot_id = l.id
    
    WHERE l.expiry_date >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
    GROUP BY l.vaccine_id
  ) stock ON stock.vaccine_id = v.id
  
  WHERE 1=1
  ${searchFilter}
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

export const vaccinationStatsLimit10 = async (req, res) => {
  try {   
const query = `
  SELECT
    v.id,
    v.code,
    v.name,
    -- 1. Số mũi đã tiêm (đếm tổng số record)
    COALESCE(stats.total_doses, 0)::int AS doses_given,

    -- 2. Số lượng còn lại (chỉ tính lô còn hạn và trừ đi số đã dùng)
    COALESCE(stock.available_qty, 0)::int AS remaining

  FROM vaccines v

  -- Subquery 1: Tính tổng số mũi đã tiêm (để sắp xếp và hiển thị)
  LEFT JOIN (
    SELECT 
        vaccine_id, 
        COUNT(*) AS total_doses -- Sửa từ SUM(dose_number) thành COUNT(*)
    FROM administrations
    GROUP BY vaccine_id
  ) stats ON stats.vaccine_id = v.id

  -- Subquery 2: Tính tồn kho thực tế (Logic chuẩn)
  LEFT JOIN (
    SELECT
        l.vaccine_id,
        -- Tổng (Số lượng nhập - Số lượng đã dùng của lô đó)
        SUM(l.quantity - COALESCE(usage.used_count, 0)) AS available_qty
    FROM vaccine_lots l
    -- Đếm số lượng đã dùng của riêng từng lô
    LEFT JOIN (
        SELECT vaccine_lot_id, COUNT(*) as used_count
        FROM administrations
        GROUP BY vaccine_lot_id
    ) usage ON usage.vaccine_lot_id = l.id
    
    -- Chỉ lấy lô còn hạn (ép kiểu về giờ VN để tránh lỗi ngày như Lô 002)
    WHERE l.expiry_date >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
    GROUP BY l.vaccine_id
  ) stock ON stock.vaccine_id = v.id

  -- Sắp xếp theo số lượng đã tiêm giảm dần (Top 10)
  ORDER BY doses_given DESC
  LIMIT 10;
`;

    const result = await sql.unsafe(query);

    // Trả về dữ liệu gọn nhẹ
    res.json({
        data: result
    });

  } catch (error) {
    console.error("Error fetching top vaccines:", error);
    res.status(500).json({ error: "Error when retrieving top vaccination statistics" });
  }
};