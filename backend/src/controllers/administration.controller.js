import { sql } from "../config/db.js";

export const createAdministration = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doseNumber, adverseEvents } = req.body;

    const administration = await sql`
            UPDATE administrations a
            SET dose_number = ${doseNumber}, adverse_events = ${adverseEvents}, administered_at = NOW()
            WHERE a.appointment_id = ${appointmentId}
            RETURNING *;
        `;

    res.status(201).json(administration[0]);
  } catch (error) {
    console.error("Error creating administration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search citizens by national ID
export const searchCitizensByNationalId = async (req, res) => {
  try {
    const { nationalId } = req.query;

    const results = await sql`
            SELECT
                u.full_name as full_name,
                string_agg(v.name, ', ') AS vaccine_names,
                scheduled_at,
                status,
                notes
            FROM appointments a
            JOIN citizens c ON a.citizen_id = c.id
            JOIN users u ON c.user_id = u.id
            JOIN appointment_vaccines av ON a.id = av.appointment_id
            JOIN vaccines v ON av.vaccine_id = v.id
            WHERE c.national_id = ${nationalId}
            GROUP BY full_name, scheduled_at, status, notes
            ORDER BY scheduled_at DESC
        `;

    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching citizens:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
