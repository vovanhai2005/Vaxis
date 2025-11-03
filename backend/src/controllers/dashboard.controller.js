import { sql } from '../config/db.js';
import { generateToken } from '../lib/utils.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // 1️⃣ Tổng số mũi đã tiêm (completed)
    const totalCompleted = await sql`
      SELECT COUNT(*)::int AS count
      FROM appointments
      WHERE status = 'completed'
    `;

    // 2️⃣ Tổng vắc-xin tồn kho (số lượng vaccine_lots chưa hết hạn)
    const totalStock = await sql`
      SELECT COALESCE(SUM(quantity), 0)::int AS total
      FROM vaccine_lots
      WHERE expiry_date > NOW()
    `;

    // 3️⃣ Tổng công dân
    const totalCitizens = await sql`
      SELECT COUNT(*)::int AS total
      FROM citizens
    `;

    // 4️⃣ Lô sắp hết hạn (trong 30 ngày tới)
    const expiringBatches = await sql`
      SELECT COUNT(*)::int AS total
      FROM vaccine_lots
      WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    `;

    // 5️⃣ Tỷ lệ tiêm chủng (biểu đồ tròn)
    const vaccinationRate = await sql`
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS da_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at >= NOW() THEN 1 ELSE 0 END)::int AS chua_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at < NOW() THEN 1 ELSE 0 END)::int AS qua_han
      FROM appointments
    `;

    // 6️⃣ Số mũi tháng này (biểu đồ cột)
    const monthlyStats = await sql`
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS da_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at >= NOW() THEN 1 ELSE 0 END)::int AS chua_tiem,
        SUM(CASE WHEN status = 'booked' AND scheduled_at < NOW() THEN 1 ELSE 0 END)::int AS qua_han
      FROM appointments
      WHERE DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', NOW())
    `;

    // 7️⃣ Gộp dữ liệu lại để trả về frontend
    const dashboard = {
      summary: {
        totalVaccinated: totalCompleted[0].count,
        totalStock: totalStock[0].total,
        totalCitizens: totalCitizens[0].total,
        expiringBatches: expiringBatches[0].total
      },
      charts: {
        vaccinationRate: vaccinationRate[0], // { da_tiem, chua_tiem, qua_han }
        monthlyStats: monthlyStats[0]        // { da_tiem, chua_tiem, qua_han }
      }
    };
   
    res.status(200).json(dashboard);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
