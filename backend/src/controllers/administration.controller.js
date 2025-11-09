import { sql } from "../config/db.js";

export const createAdministration = async (req, res) => {
  try {
    const {
      appointmentId,
      citizenId,
      vaccineId,
      vaccineLotId,
      doseNumber,
      adverseEvents,
    } = req.body;

    const administration = await sql`
            INSERT INTO administrations (
                appointment_id,
                citizen_id,
                vaccine_id,
                vaccine_lot_id,
                dose_number,
                adverse_events
            ) VALUES (
                ${appointmentId},
                ${citizenId},
                ${vaccineId},
                ${vaccineLotId},
                ${doseNumber},
                ${adverseEvents}
            )
            RETURNING *
        `;

    res.status(201).json(administration[0]);
  } catch (error) {
    console.error("Error creating administration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdministrationHistory = async (req, res) => {
  try {
    const { citizenId } = req.params;

    const history = await sql`
            SELECT 
                a.*,
                v.name as vaccine_name,
                vl.lot_number
            FROM administrations a
            JOIN vaccines v ON a.vaccine_id = v.id
            LEFT JOIN vaccine_lots vl ON a.vaccine_lot_id = vl.id
            WHERE a.citizen_id = ${citizenId}
            ORDER BY a.administered_at DESC
        `;

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching administration history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search citizens by national ID
export const searchCitizensByNationalId = async (req, res) => {
  try {
    const { nationalId } = req.params;

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
