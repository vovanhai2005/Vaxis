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

// Thêm lô mới (báo cáo tồn kho)
export const addLot = async (req, res) => {
  try {
    const { vaccine_id, lot_number, notes, quantity, expiry_date } = req.body;

    const result = await sql`
      INSERT INTO vaccine_lots (vaccine_id, lot_number, notes, quantity, expiry_date)
      VALUES (${vaccine_id}, ${lot_number}, ${notes}, ${quantity}, ${expiry_date})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error adding lot:", error);
    res.status(500).json({ error: "Unable to add more vaccine batches" });
  }
};

// Sửa lô vaccine (báo cáo tồn kho)
export const editLot = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaccine_id, lot_number, quantity, expiry_date } = req.body;

    const result = await sql`
      UPDATE vaccine_lots
      SET 
        vaccine_id = COALESCE(${vaccine_id}, vaccine_id),
        lot_number = COALESCE(${lot_number}, lot_number),
        quantity = COALESCE(${quantity}, quantity),
        expiry_date = COALESCE(${expiry_date}, expiry_date)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Lot not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error editing lot:", error);
    res.status(500).json({ error: "Unable to edit vaccine batch" });
  }
};

// Xóa lô (báo cáo tồn kho)
export const deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM vaccine_lots WHERE id = ${id}`;
    res.json({ message: "Vaccine batch deleted" });
  } catch (error) {
    console.error("Error deleting lot:", error);
    res.status(500).json({ error: "Unable to delete vaccine batch" });
  }
};
