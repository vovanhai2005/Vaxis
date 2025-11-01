import { sql } from "../config/db.js";

export const makeAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { scheduled_at, notes, vaccineIds } = req.body; // Expect an array of vaccine IDs

        if (!scheduled_at) {
            return res.status(400).json({ message: "Appointment date and time are required." });
        }

        if (!vaccineIds || !Array.isArray(vaccineIds) || vaccineIds.length === 0) {
            return res.status(400).json({ message: "At least one vaccine must be selected." });
        }

        // Find the citizen ID linked to the user ID
        const citizenResult = await sql`
            SELECT id FROM citizens WHERE user_id = ${userId}
        `;

        if (citizenResult.length === 0) {
            return res.status(404).json({ message: "Citizen profile not found for this user." });
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
        const queries = vaccineIds.map(vaccineId => sql`
            INSERT INTO appointment_vaccines (appointment_id, vaccine_id)
            VALUES (${appointmentId}, ${vaccineId})
        `);
        
        // Execute all insert queries
        await Promise.all(queries);

        res.status(201).json({
            message: "Appointment made successfully.",
            appointment: newAppointment
        });
        
    } catch (error) {
        console.error("Error making appointment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

