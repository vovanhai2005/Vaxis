import { sql } from "../config/db.js";
import { getCache, setCache, deleteCache, cacheKeys } from "../lib/cache.js";

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

    // Invalidate appointments cache
    await deleteCache(cacheKeys.appointments(userId));

    res.status(201).json({
      message: "Appointment made successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error making appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCitizenAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheKeys.appointments(userId);

    // Try to get from cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
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

    // Fetch appointments for the citizen
    const appointments = await sql`
      SELECT 
          a.id,
          a.scheduled_at,
          a.status,
          a.notes,
          json_agg(json_build_object('id', v.id, 'name', v.name, 'price', v.price)) AS vaccines
      FROM appointments a
      LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
      LEFT JOIN vaccines v ON av.vaccine_id = v.id
      WHERE a.citizen_id = ${citizenId}
      GROUP BY a.id
      ORDER BY a.scheduled_at DESC
    `;

    // Cache for 3 minutes
    await setCache(cacheKey, appointments, 180);

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching citizen appointments:", error);
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
        a.id,
        u.full_name AS citizen_name,
        u.phone,
        c.address,
        c.national_id,
        string_agg(v.name, ', ') AS vaccine_names,
        a.scheduled_at as time,
        a.status as status,
        a.notes as notes
      FROM appointments a
      JOIN citizens c ON a.citizen_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
      LEFT JOIN vaccines v ON av.vaccine_id = v.id
      WHERE a.scheduled_at > ${now} AND a.status IN ('booked', 'checked_in', 'administered')
      GROUP BY a.id, u.full_name, a.scheduled_at, a.status, a.notes, u.phone, c.address, c.national_id
      ORDER BY a.scheduled_at ASC
      LIMIT 10;
    `;
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Edit appointment
export const editAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_at, status, notes } = req.body;

    // Build update fields dynamically, only including provided values
    const updates = [];
    const values = [];

    if (scheduled_at !== undefined && scheduled_at !== null) {
      updates.push('scheduled_at');
      // Ensure the date is properly formatted for PostgreSQL
      values.push(new Date(scheduled_at).toISOString());
    }
    if (status !== undefined && status !== null) {
      updates.push('status');
      values.push(status);
    }
    if (notes !== undefined && notes !== null) {
      updates.push('notes');
      values.push(notes);
    }

    // Always update the updated_at timestamp
    updates.push('updated_at');
    values.push(sql`NOW()`);

    if (updates.length === 1) { // Only updated_at, no actual changes
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await sql`
      UPDATE appointments
      SET ${sql(updates.reduce((acc, field, i) => {
        acc[field] = values[i];
        return acc;
      }, {}))}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error editing appointment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the appointment
    await sql`
      DELETE FROM appointments
      WHERE id = ${id};
    `;

    res.status(200).json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Check-in citizen for their appointment
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { temperature, blood_pressure } = req.body;

    if (!temperature || !blood_pressure) {
      return res
        .status(400)
        .json({ message: "Temperature and blood pressure are required." });
    }

    const updatedStatus = await sql`
      UPDATE appointments
      SET status = 'checked_in'
      WHERE id = ${appointmentId}
      RETURNING *;
    `;

    const checkInDetails = updatedStatus[0];
    const citizenId = checkInDetails.citizen_id;
    const vaccineId = await sql`
      SELECT DISTINCT ON (av.vaccine_id)
        av.vaccine_id,
        vl.id AS vaccine_lot_id,
        vl.quantity
      FROM appointment_vaccines av
      JOIN vaccine_lots vl ON av.vaccine_id = vl.vaccine_id
      WHERE av.appointment_id = ${appointmentId} AND vl.quantity > 0
      ORDER BY av.vaccine_id, vl.quantity;

    `;
    if (vaccineId.length === 0) {
      return res
        .status(404)
        .json({ message: "No vaccines found for this appointment." });
    }
    // Link the check-in details to administrations table
    const queries = vaccineId.map(
      (vaccine) => sql`
      INSERT INTO administrations (appointment_id, citizen_id, vaccine_id, vaccine_lot_id, temperature, blood_pressure)
      VALUES (${appointmentId}, ${citizenId}, ${vaccine.vaccine_id}, ${vaccine.vaccine_lot_id} , ${temperature}, ${blood_pressure})
      RETURNING *;
    `
    );
    await Promise.all(queries);

    res.status(200).json({
      message: "Check-in successful",
      appointment: updatedStatus[0],
    });
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete appointment when administered and paid
export const completeAppointment = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;

    // Check if appointment is administered and bill is paid
    const appointmentCheck = await sql`
      SELECT 
        a.id,
        a.status,
        b.paid
      FROM appointments a
      JOIN administrations ad ON a.id = ad.appointment_id
      JOIN bills b ON ad.bill_id = b.id
      WHERE a.id = ${appointmentId}
      LIMIT 1
    `;

    if (appointmentCheck.length === 0) {
      return res.status(404).json({ message: "Appointment not found or not administered yet" });
    }

    const appointment = appointmentCheck[0];

    if (appointment.status === 'administered' && appointment.paid === true) {
      // Update appointment status to completed
      const updated = await sql`
        UPDATE appointments
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${appointmentId}
        RETURNING *;
      `;

      // Get citizen user_id for notification
      const appointmentData = await sql`
        SELECT c.user_id, u.full_name, v.name as vaccine_name
        FROM appointments a
        JOIN citizens c ON a.citizen_id = c.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
        LEFT JOIN vaccines v ON av.vaccine_id = v.id
        WHERE a.id = ${appointmentId}
        LIMIT 1
      `;

      if (appointmentData.length > 0) {
        const citizenUserId = appointmentData[0].user_id;
        const vaccineName = appointmentData[0].vaccine_name || 'vaccination';
        
        // Create notification for citizen
        await sql`
          INSERT INTO notifications (user_id, type, title, message, related_id)
          VALUES (
            ${citizenUserId}, 
            'appointment', 
            'Vaccination Complete',
            ${`Your ${vaccineName} vaccination has been completed successfully. You can download your certificate from your profile.`},
            ${appointmentId}
          )
        `;
      }

      return res.status(200).json({
        message: "Appointment completed successfully",
        appointment: updated[0],
      });
    } else {
      return res.status(400).json({
        message: "Appointment cannot be completed. Status must be 'administered' and bill must be paid.",
        current_status: appointment.status,
        bill_paid: appointment.paid
      });
    }
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
