import { sql } from '../config/db.js';
import { getCache, setCache, deleteCache, cacheKeys } from '../lib/cache.js';

 //  Lô sắp hết hạn (trong 30 ngày tới) (dashboard admin)
export const expiringBatches = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager only.' });
    }

    const cacheKey = 'stats:expiring_batches';
    const cached = await getCache(cacheKey);
    if (cached !== null) {
      return res.status(200).json({ expiringBatches: cached });
    }

    const result = await sql`
      SELECT COUNT(*)::int AS total
      FROM vaccine_lots
      WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    `;
    const expiringBatches = result[0]?.total ?? 0;

    // Cache for 5 minutes
    await setCache(cacheKey, expiringBatches, 300);

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

    const cacheKey = 'stats:total_stock';
    const cached = await getCache(cacheKey);
    if (cached !== null) {
      return res.status(200).json({ totalStock: cached });
    }

    const result = await sql`
     SELECT COALESCE(SUM(quantity), 0)::int AS total
      FROM vaccine_lots
      WHERE expiry_date > NOW()
    `;
    const totalStock = result[0]?.total ?? 0;

    // Cache for 5 minutes
    await setCache(cacheKey, totalStock, 300);

    res.status(200).json({ totalStock });
  } catch (error) {
    console.error('Error fetching total completed vaccinations:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// xem detail
export const getLotById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `vaccine_lot:${id}`;

        // Try to get from cache
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const result = await sql`
            SELECT 
                vl.*,
                v.name,
                v.code,
                v.image_url,
                v.manufacturer
            FROM vaccine_lots vl
            JOIN vaccines v ON vl.vaccine_id = v.id
            WHERE vl.id = ${id}
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: 'Lot not found.' });
        }

        // Cache for 5 minutes
        await setCache(cacheKey, result[0], 300);

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching lot detail:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Thêm lô mới (báo cáo tồn kho)
export const addLot = async (req, res) => {
  try {
    const { vaccine_id, lot_number, notes, quantity, expiry_date } = req.body;

	const existing = await sql`SELECT id FROM vaccine_lots WHERE vaccine_id = ${vaccine_id} AND lot_number = ${lot_number}`;
    if (existing.length > 0) {
        return res.status(400).json({ error: "Lot number already exists for this vaccine." });
    }
    const result = await sql`
      INSERT INTO vaccine_lots (vaccine_id, lot_number, notes, quantity, expiry_date)
      VALUES (${vaccine_id}, ${lot_number}, ${notes}, ${quantity}, ${expiry_date})
      RETURNING *
    `;

    // Invalidate caches
    await deleteCache('stats:expiring_batches');
    await deleteCache('stats:total_stock');
    await deleteCache(cacheKeys.vaccineLots(vaccine_id));

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
    const { lot_number, quantity, expiry_date, notes } = req.body;

    const result = await sql`
      UPDATE vaccine_lots
      SET 
        lot_number = COALESCE(${lot_number}, lot_number),
        quantity = COALESCE(${quantity}, quantity),
        expiry_date = COALESCE(${expiry_date}, expiry_date),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Lot not found" });
    }

    // Invalidate caches
    await deleteCache(`vaccine_lot:${id}`);
    await deleteCache('stats:expiring_batches');
    await deleteCache('stats:total_stock');

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

    // Invalidate caches
    await deleteCache(`vaccine_lot:${id}`);
    await deleteCache('stats:expiring_batches');
    await deleteCache('stats:total_stock');

    res.json({ message: "Vaccine batch deleted" });
  } catch (error) {
    console.error("Error deactivating lot:", error);
    res.status(500).json({ error: "Unable to deactivate vaccine lot" });
  }
};