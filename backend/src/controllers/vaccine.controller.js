import { sql } from '../config/db.js';
import cloudinary from "../lib/cloudinary.js";
import { getCache, setCache, deleteCache, cacheKeys } from "../lib/cache.js";

export const getVaccines = async (req, res) => {
    try {
        const cacheKey = cacheKeys.vaccines();
        
        // Try to get from cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        
        const vaccines = await sql`
            SELECT 
                v.*,
                COALESCE(SUM(CASE 
                    WHEN vl.expiry_date > NOW() THEN vl.quantity 
                    ELSE 0 
                END), 0)::int AS available_quantity
            FROM vaccines v
            LEFT JOIN vaccine_lots vl ON v.id = vl.vaccine_id
            GROUP BY v.id
        `;
        
        // Cache for 10 minutes
        await setCache(cacheKey, vaccines, 600);
        
        res.status(200).json(vaccines);
    } catch (error) {
        console.error('Error fetching vaccines:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getVaccinesByID = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = cacheKeys.vaccine(id);
        
        // Try to get from cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        
        const vaccine = await sql`SELECT * FROM vaccines WHERE id = ${id}`;
        if (vaccine.length === 0) {
            return res.status(404).json({ message: 'Vaccine not found.' });
        }
        
        // Cache for 10 minutes
        await setCache(cacheKey, vaccine[0], 600);
        
        res.status(200).json(vaccine[0]);
    } catch (error) {
        console.error('Error fetching vaccine by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const addVaccine = async (req, res) => {
    try {
        const { code, name, manufacturer, description, price, imageUrl } = req.body;
        
		const existingCode = await sql`SELECT * FROM vaccines WHERE code = ${code}`;
		if (existingCode.length > 0) {
		return res.status(400).json({ message: "Code is already taken." });
		}
		
        let vaccineImageUrl = null;

        // Upload vaccine image to Cloudinary if provided (temporary storage)
        if (imageUrl) {
            const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                resource_type: 'auto',
                type: 'upload'
            });
            vaccineImageUrl = uploadResponse.secure_url;
        }

        const newVaccine = await sql`
            INSERT INTO vaccines (code, name, manufacturer, description, price, image_url) 
            VALUES (${code}, ${name}, ${manufacturer}, ${description}, ${price}, ${vaccineImageUrl}) 
            RETURNING *
        `;
        
        // Invalidate vaccines cache
        await deleteCache(cacheKeys.vaccines());
        
        res.status(201).json(newVaccine[0]);
    } catch (error) {
        console.error('Error adding new vaccine:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const editVaccine = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, manufacturer, description, price, imageUrl } = req.body; 

    let vaccineImageUrl = null; 

    if (imageUrl && imageUrl.startsWith('data:image')) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                resource_type: 'auto',
                type: 'upload'
            });
            vaccineImageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary upload failed:", uploadError);
            return res.status(500).json({ error: "Image upload failed" });
        }
    }

    // Câu lệnh SQL update (đã thêm image_url)
    const result = await sql`
      UPDATE vaccines
      SET
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        manufacturer = COALESCE(${manufacturer}, manufacturer),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        image_url = COALESCE(${vaccineImageUrl}, image_url) 
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    // Invalidate caches
    await deleteCache(cacheKeys.vaccines());
    await deleteCache(cacheKeys.vaccine(id));

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error editing vaccine:", error);
    res.status(500).json({ error: "Unable to edit vaccine" });
  }
};

export const deleteVaccine = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Thực hiện Transaction Database
    const result = await sql.begin(async (sql) => {
      // A. Deactivate Vaccine
      const [vaccine] = await sql`
        UPDATE vaccines
        SET active = false
        WHERE id = ${id}
        RETURNING *
      `;

      if (!vaccine) {
        throw new Error("VACCINE_NOT_FOUND");
      }

      // B. Deactivate tất cả các Lô thuốc thuộc vaccine này
      await sql`
        UPDATE vaccine_lots
        SET active = false
        WHERE vaccine_id = ${id}
      `;

      return vaccine;
    });

    // 2. Xóa Cache (Chỉ chạy khi Transaction thành công)
    // Sửa lỗi: Đưa đoạn này từ catch lên đây
    try {
        // Xóa cache danh sách tổng
        await deleteCache(cacheKeys.vaccines());
        
        // Xóa cache chi tiết của vaccine này (nếu bạn có lưu key này)
        // await deleteCache(cacheKeys.vaccine(id)); 
    } catch (cacheError) {
        console.error("Redis Cache Error (Non-blocking):", cacheError);
        // Lưu ý: Lỗi xóa cache không nên làm fail request chính, nên ta try/catch riêng hoặc lờ đi
    }

    // 3. Trả về kết quả thành công
    res.status(200).json({ 
      message: "Vaccine and related lots deactivated successfully", 
      vaccine: result 
    });

  } catch (error) {
    console.error("Error deactivating vaccine:", error);
    
    // Xử lý các loại lỗi cụ thể
    if (error.message === "VACCINE_NOT_FOUND") {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    // Lỗi server chung
    res.status(500).json({ error: "Unable to deactivate vaccine" });
  }
};