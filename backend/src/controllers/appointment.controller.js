import { sql } from "../config/db.js";
import { getCache, setCache, deleteCache, cacheKeys } from "../lib/cache.js";
import { emitNotificationToUser } from "../lib/socket.js";

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
          json_agg(DISTINCT jsonb_build_object('id', v.id, 'name', v.name, 'price', v.price, 'manufacturer', v.manufacturer)) AS vaccines,
          doc_user.full_name AS administered_by
      FROM appointments a
      LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
      LEFT JOIN vaccines v ON av.vaccine_id = v.id
      LEFT JOIN administrations ad ON a.id = ad.appointment_id
      LEFT JOIN employees e ON ad.doctor_id = e.id
      LEFT JOIN users doc_user ON e.user_id = doc_user.id
      WHERE a.citizen_id = ${citizenId}
      GROUP BY a.id, doc_user.full_name
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
        string_agg(DISTINCT v.name, ', ') AS vaccine_names,
        a.scheduled_at as time,
        a.status as status,
        a.notes as notes,
        doc_user.full_name AS doctor_name,
        e.employee_number AS doctor_employee_number
      FROM appointments a
      JOIN citizens c ON a.citizen_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
      LEFT JOIN vaccines v ON av.vaccine_id = v.id
      LEFT JOIN administrations ad ON a.id = ad.appointment_id
      LEFT JOIN employees e ON ad.doctor_id = e.id
      LEFT JOIN users doc_user ON e.user_id = doc_user.id
      WHERE a.scheduled_at > ${now} AND a.status IN ('booked', 'checked_in', 'administered', 'completed')
      GROUP BY a.id, u.full_name, a.scheduled_at, a.status, a.notes, u.phone, c.address, c.national_id, doc_user.full_name, e.employee_number
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

    const { assignedDoctor, updatedStatus, createdAdmins, createdNotification } =
      await sql.begin(async (sql) => {

        // Step 1: Select & lock the least-busy available doctor.
        const [doctor] = await sql`
          SELECT
            e.id                AS employee_id,
            e.user_id,
            u.full_name         AS doctor_name,
            e.employee_number,
            (
              SELECT COUNT(*)
              FROM administrations ad
              WHERE ad.doctor_id = e.id
                AND ad.administered_at IS NULL
            )                   AS current_assignments
          FROM employees e
          JOIN users u ON e.user_id = u.id
          WHERE e.role_title = 'Doctor'
          ORDER BY current_assignments ASC, RANDOM()
          LIMIT 1
          FOR UPDATE OF e SKIP LOCKED
        `;

        if (!doctor) {
          throw Object.assign(new Error("No doctors available."), { code: "NO_DOCTORS" });
        }

        // Step 2: Mark appointment as checked-in.
        const [appointment] = await sql`
          UPDATE appointments
          SET status = 'checked_in'
          WHERE id = ${appointmentId}
          RETURNING *
        `;

        const citizenId = appointment.citizen_id;

        // Step 3: Resolve vaccine lots for this appointment.
        const vaccines = await sql`
          SELECT DISTINCT ON (av.vaccine_id)
            av.vaccine_id,
            vl.id AS vaccine_lot_id,
            vl.quantity
          FROM appointment_vaccines av
          JOIN vaccine_lots vl ON av.vaccine_id = vl.vaccine_id
          WHERE av.appointment_id = ${appointmentId}
            AND vl.quantity > 0
          ORDER BY av.vaccine_id, vl.quantity
        `;

        if (vaccines.length === 0) {
          throw Object.assign(new Error("No vaccines found for this appointment."), { code: "NO_VACCINES" });
        }

        // Step 4: Insert administration records with the locked doctor.
        const admins = await Promise.all(
          vaccines.map((vaccine) => sql`
            INSERT INTO administrations
              (appointment_id, citizen_id, vaccine_id, vaccine_lot_id,
               temperature, blood_pressure, doctor_id)
            VALUES
              (${appointmentId}, ${citizenId}, ${vaccine.vaccine_id},
               ${vaccine.vaccine_lot_id}, ${temperature}, ${blood_pressure},
               ${doctor.employee_id})
            RETURNING *
          `)
        );

        // Step 5: Resolve citizen name and vaccine names for notification.
        const [citizenDetail] = await sql`
          SELECT u.full_name, u.id AS user_id
          FROM citizens c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ${citizenId}
        `;

        const vaccineNames = await sql`
          SELECT v.name
          FROM appointment_vaccines av
          JOIN vaccines v ON av.vaccine_id = v.id
          WHERE av.appointment_id = ${appointmentId}
        `;

        const citizenName = citizenDetail?.full_name || "A citizen";
        const vaccineList = vaccineNames.map((v) => v.name).join(", ");
        const notifTitle = "New Patient Checked In";
        const notifMessage = `${citizenName} has checked in and has been assigned to you. Vaccines: ${vaccineList}`;

        // Step 6: Persist the notification inside the same transaction.
        const [notification] = await sql`
          INSERT INTO notifications (user_id, type, title, message, related_id)
          VALUES (${doctor.user_id}, 'appointment', ${notifTitle}, ${notifMessage}, ${appointmentId})
          RETURNING *
        `;

        return {
          assignedDoctor: doctor,
          updatedStatus: appointment,
          createdAdmins: admins,
          createdNotification: notification,
        };
      });

    // Emit real-time notification to the doctor (outside transaction — non-blocking).
    try {
      emitNotificationToUser(assignedDoctor.user_id, "notification:new", {
        id: createdNotification.id,
        type: "appointment",
        title: createdNotification.title,
        message: createdNotification.message,
        related_id: appointmentId,
        created_at: createdNotification.created_at,
        is_read: false,
      });
    } catch (socketError) {
      console.error("Error emitting socket notification:", socketError);
      // Non-fatal: notification is already persisted in the DB.
    }

    res.status(200).json({
      message: "Check-in successful",
      appointment: updatedStatus,
      assigned_doctor: {
        id: assignedDoctor.employee_id,
        name: assignedDoctor.doctor_name,
        employee_number: assignedDoctor.employee_number,
      },
    });
  } catch (error) {
    console.error("Error during check-in:", error);

    if (error.code === "NO_DOCTORS") {
      return res.status(400).json({ message: "No doctors available. Please try again later." });
    }
    if (error.code === "NO_VACCINES") {
      return res.status(404).json({ message: "No vaccines found for this appointment." });
    }

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
