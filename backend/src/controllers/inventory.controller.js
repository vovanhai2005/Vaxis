import { sql } from "../config/db.js";

// Lấy danh sách vaccine + lô
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



// Thêm lô mới tạm thời để test
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

// Xóa lô
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
