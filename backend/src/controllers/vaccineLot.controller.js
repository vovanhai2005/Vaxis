import { sql } from '../config/db.js';

 //  Lô sắp hết hạn (trong 30 ngày tới) (dashboard admin)
export const expiringBatches = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }
    const result = await sql`
      SELECT COUNT(*)::int AS total
      FROM vaccine_lots
      WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    `;
    const expiringBatches = result[0]?.total ?? 0;
    res.status(200).json({ expiringBatches });
  } catch (error) {
    console.error('Error fetching total completed vaccinations:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

//  Tổng vắc-xin tồn kho (số lượng vaccine_lots chưa hết hạn) (dashboard admin)
export const totalStock = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }
    const result = await sql`
     SELECT COALESCE(SUM(quantity), 0)::int AS total
      FROM vaccine_lots
      WHERE expiry_date > NOW()
    `;
    const totalStock = result[0]?.total ?? 0;
    res.status(200).json({ totalStock });
  } catch (error) {
    console.error('Error fetching total completed vaccinations:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Thêm lô mới tạm thời để test (báo cáo tồn kho)
export const addLot = async (req, res) => {
  try {
    const { vaccine_id, lot_number, quantity, expiry_date } = req.body;

    const result = await sql`
      INSERT INTO vaccine_lots (vaccine_id, lot_number, quantity, expiry_date)
      VALUES (${vaccine_id}, ${lot_number}, ${quantity}, ${expiry_date})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error adding lot:", error);
    res.status(500).json({ error: "Không thể thêm lô vaccine" });
  }
};

// Xóa lô (báo cáo tồn kho)
export const deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM vaccine_lots WHERE id = ${id}`;
    res.json({ message: "Đã xóa lô vaccine" });
  } catch (error) {
    console.error("Error deleting lot:", error);
    res.status(500).json({ error: "Không thể xóa lô vaccine" });
  }
};