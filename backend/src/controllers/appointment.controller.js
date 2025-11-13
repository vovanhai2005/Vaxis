import { sql } from "../config/db.js";

export const makeAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduled_at, notes, vaccineIds } = req.body; // Expect an array of vaccine IDs

    if (!scheduled_at) {
      return res
        .status(400)
        .json({ message: "Appointment date and time are required." });
    }

    if (!vaccineIds || !Array.isArray(vaccineIds) || vaccineIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one vaccine must be selected." });
    }

    // Find the citizen ID linked to the user ID
    const citizenResult = await sql`
            SELECT id FROM citizens WHERE user_id = ${userId}
        `;

    if (citizenResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Citizen profile not found for this user." });
    }
    const citizenId = citizenResult[0].id;

    // Step 1: Create the appointment and get its ID
    const appointmentResult = await sql`
            INSERT INTO appointments (citizen_id, scheduled_at, notes)
            VALUES (${citizenId}, ${scheduled_at}, ${notes})
            RETURNING id, scheduled_at, status, notes
        `;

    const newAppointment = appointmentResult[0];
    const appointmentId = newAppointment.id;

    // Step 2: Link the vaccines to the appointment
    // Create an array of insert queries
    const queries = vaccineIds.map(
      (vaccineId) => sql`
            INSERT INTO appointment_vaccines (appointment_id, vaccine_id)
            VALUES (${appointmentId}, ${vaccineId})
        `
    );

    // Execute all insert queries
    await Promise.all(queries);

    res.status(201).json({
      message: "Appointment made successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error making appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Tổng số mũi đã tiêm (completed) (dashboard admin)
export const totalCompleted = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "manager") {
      return res.status(403).json({ message: "Access denied. Manager only." });
    }
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM appointments
      WHERE status = 'completed';
    `;
    const totalCompleted = result[0]?.count ?? 0;
    res.status(200).json({ totalCompleted });
  } catch (error) {
    console.error("Error fetching total completed vaccinations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Show upcoming appointments (employee dashboard)
export const upcomingAppointments = async (req, res) => {
  try {
    const now = new Date();

    const results = await sql`
      SELECT 
        u.full_name AS citizen_name,
        string_agg(v.name, ', ') AS vaccine_names,
        a.scheduled_at as time,
        a.status as status,
        a.notes as notes
      FROM appointments a
      JOIN citizens c ON a.citizen_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN appointment_vaccines av ON a.id = av.appointment_id
      JOIN vaccines v ON av.vaccine_id = v.id
      WHERE a.scheduled_at > ${now} AND a.status = 'booked'
      GROUP BY a.id, u.full_name, a.scheduled_at, a.status, a.notes
      ORDER BY a.scheduled_at ASC
      LIMIT 10;
    `;
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
