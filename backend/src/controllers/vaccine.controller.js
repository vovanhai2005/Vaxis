import { sql } from '../config/db.js';
import cloudinary from "../lib/cloudinary.js";

export const getVaccines = async (req, res) => {
    try {
        const vaccines = await sql`SELECT * FROM vaccines WHERE active = TRUE`;
        res.status(200).json(vaccines);
    } catch (error) {
        console.error('Error fetching vaccines:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getVaccinesByID = async (req, res) => {
    try {
        const { id } = req.params;
        const vaccine = await sql`SELECT * FROM vaccines WHERE id = ${id}`;
        if (vaccine.length === 0) {
            return res.status(404).json({ message: 'Vaccine not found.' });
        }
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

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error editing vaccine:", error);
    res.status(500).json({ error: "Unable to edit vaccine" });
  }
};

export const deleteVaccine = async (req, res) => {
  try {
    const { id } = req.params;

    // Sử dụng Transaction để đảm bảo an toàn dữ liệu
    // Nếu cập nhật vaccine thành công mà cập nhật lô lỗi, nó sẽ tự hoàn tác (rollback)
    const result = await sql.begin(async (sql) => {
      // 1. Deactivate Vaccine
      const [vaccine] = await sql`
        UPDATE vaccines
        SET active = false
        WHERE id = ${id}
        RETURNING *
      `;

      if (!vaccine) {
        throw new Error("VACCINE_NOT_FOUND");
      }

      // 2. Deactivate tất cả các Lô thuốc thuộc vaccine này
      await sql`
        UPDATE vaccine_lots
        SET active = false
        WHERE vaccine_id = ${id}
      `;

      return vaccine;
    });

    res.status(200).json({ 
      message: "Vaccine and related lots deactivated successfully", 
      vaccine: result 
    });

  } catch (error) {
    console.error("Error deactivating vaccine:", error);
    
    if (error.message === "VACCINE_NOT_FOUND") {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    res.status(500).json({ error: "Unable to deactivate vaccine" });
  }
};

export const restoreVaccine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql.begin(async (sql) => {
      // 1. Activate Vaccine
      const [vaccine] = await sql`
        UPDATE vaccines
        SET active = true
        WHERE id = ${id}
        RETURNING *
      `;

      if (!vaccine) {
        throw new Error("VACCINE_NOT_FOUND");
      }

      // 2. Activate lại tất cả các Lô thuốc thuộc vaccine này
      // (Lô hết hạn vẫn sẽ active=true, nhưng query tiêm chủng sẽ tự lọc bỏ)
      await sql`
        UPDATE vaccine_lots
        SET active = true
        WHERE vaccine_id = ${id}
      `;

      return vaccine;
    });

    res.status(200).json({ 
      message: "Vaccine and related lots restored successfully", 
      vaccine: result 
    });

  } catch (error) {
    console.error("Error restoring vaccine:", error);

    if (error.message === "VACCINE_NOT_FOUND") {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    res.status(500).json({ error: "Unable to restore vaccine" });
  }
};