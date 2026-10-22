import { sql } from "../config/db.js";

export const createAdministration = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doseNumber, adverseEvents } = req.body;

    if (!appointmentId || doseNumber == null) {
      return res.status(400).json({
        message: "appointmentId and doseNumber are required.",
      });
    }

    const { administration, appointmentStatus, newBill, notification } =
      await sql.begin(async (sql) => {
        const [administration] = await sql`
          UPDATE administrations
          SET
            dose_number     = ${doseNumber},
            adverse_events  = ${adverseEvents ?? null},
            administered_at = NOW()
          WHERE appointment_id = ${appointmentId}
            AND administered_at IS NULL
          RETURNING *
        `;

        if (!administration) {
          throw Object.assign(
            new Error("Administration already recorded or not found."),
            { code: "ALREADY_DONE" }
          );
        }

        const [appointment] = await sql`
          UPDATE appointments
          SET status     = 'administered',
              updated_at = NOW()
          WHERE id     = ${appointmentId}
            AND status = 'checked_in'
          RETURNING *
        `;

        if (!appointment) {
          throw Object.assign(
            new Error("Appointment is not in checked_in state."),
            { code: "INVALID_STATUS" }
          );
        }

        const vaccineDetails = await sql`
          SELECT DISTINCT ON (av.vaccine_id)
            av.vaccine_id,
            vl.id       AS vaccine_lot_id,
            vl.quantity,
            v.name      AS vaccine_name,
            v.price
          FROM appointment_vaccines av
          JOIN vaccine_lots vl ON av.vaccine_id = vl.vaccine_id
          JOIN vaccines     v  ON av.vaccine_id = v.id
          WHERE av.appointment_id = ${appointmentId}
          ORDER BY av.vaccine_id, vl.quantity DESC
          FOR UPDATE OF vl
        `;

        if (vaccineDetails.length === 0) {
          throw Object.assign(
            new Error("No vaccine lots found for this appointment."),
            { code: "NO_LOTS" }
          );
        }

        const outOfStock = vaccineDetails.filter((v) => v.quantity <= 0);
        if (outOfStock.length > 0) {
          throw Object.assign(
            new Error("One or more vaccines are out of stock."),
            { code: "OUT_OF_STOCK" }
          );
        }

        const lotIds = vaccineDetails.map((v) => v.vaccine_lot_id);

        await sql`
          UPDATE vaccine_lots
          SET quantity = quantity - 1
          WHERE id = ANY(${lotIds})
            AND quantity > 0
        `;

        const totalAmount = vaccineDetails.reduce((sum, v) => {
          const price = parseInt(String(v.price).replace(/[^0-9]/g, ""), 10);
          return sum + (isNaN(price) ? 0 : price);
        }, 0);


        const [newBill] = await sql`
          INSERT INTO bills (citizen_id, amount_cents, paid, issued_at)
          VALUES (${appointment.citizen_id}, ${totalAmount}, false, NOW())
          RETURNING *
        `;

        await sql`
          UPDATE administrations
          SET bill_id = ${newBill.id}
          WHERE appointment_id = ${appointmentId}
        `;


        const [citizenDetail] = await sql`
          SELECT u.id AS user_id, u.full_name
          FROM citizens c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ${appointment.citizen_id}
        `;

        const citizenName = citizenDetail?.full_name ?? "Patient";
        const vaccineList = vaccineDetails.map((v) => v.vaccine_name).join(", ");

        const [notification] = await sql`
          INSERT INTO notifications (user_id, type, title, message, related_id)
          VALUES (
            ${citizenDetail.user_id},
            'appointment',
            'Vaccination Administered',
            ${`Your ${vaccineList} vaccination has been administered successfully. Please proceed to payment.`},
            ${appointmentId}
          )
          RETURNING *
        `;

        return {
          administration,
          appointmentStatus: appointment.status,
          newBill,
          notification,
          citizenUserId: citizenDetail.user_id,
        };
      });

    try {
      emitNotificationToUser(
        notification.user_id ?? newBill.citizen_id,
        "notification:new",
        {
          id: notification.id,
          type: "appointment",
          title: notification.title,
          message: notification.message,
          related_id: appointmentId,
          created_at: notification.created_at,
          is_read: false,
        }
      );
    } catch (socketError) {
      console.error("Socket emit failed (non-fatal):", socketError);
    }

    return res.status(201).json({
      message: "Administration recorded successfully.",
      administration,
      appointmentStatus,
      bill: newBill.amount_cents,
    });

  } catch (error) {
    console.error("Error in createAdministration:", error);

    const errorMap = {
      ALREADY_DONE: [409, "Administration already recorded for this appointment."],
      INVALID_STATUS: [409, "Appointment is not in a valid state for administration."],
      OUT_OF_STOCK: [409, "One or more vaccines are out of stock. Administration cancelled."],
      NO_LOTS: [404, "No vaccine lots found for this appointment."],
    };

    const [status, message] = errorMap[error.code] ?? [500, "Internal server error."];
    return res.status(status).json({ message });
  }
};

// Search citizens by national ID or email
export const searchCitizensByNationalId = async (req, res) => {
  try {
    const { nationalId, email } = req.query;

    if (!nationalId && !email) {
      return res.status(400).json({ message: "Please provide either National ID or Email" });
    }

    // fetch citizen information
    let citizenResult;
    if (nationalId) {
      citizenResult = await sql`
        SELECT 
          c.id,
          u.full_name,
          u.dob,
          u.phone,
          u.email,
          c.national_id,
          c.address,
          c.gender,
          c.blood_type
        FROM citizens c
        JOIN users u ON c.user_id = u.id
        WHERE c.national_id = ${nationalId} LIMIT 1
      `;
    } else if (email) {
      citizenResult = await sql`
        SELECT 
          c.id,
          u.full_name,
          u.dob,
          u.phone,
          u.email,
          c.national_id,
          c.address,
          c.gender,
          c.blood_type
        FROM citizens c
        JOIN users u ON c.user_id = u.id
        WHERE u.email = ${email} LIMIT 1
      `;
    }

    if (citizenResult.length === 0) {
      return res.status(404).json({ message: "Citizen not found" });
    }
    const citizenId = citizenResult[0].id;

    // Fetch appointments for the citizen
    const appointments = await sql`
      SELECT 
          a.id,
          a.scheduled_at,
          a.status,
          a.notes,
          ad.dose_number,
          ad.temperature,
          ad.blood_pressure,
          ad.adverse_events,
          ad.bill_id,
          json_agg(DISTINCT jsonb_build_object('id', v.id, 'name', v.name, 'price', v.price, 'manufacturer', v.manufacturer)) AS vaccines,
          doc_user.full_name AS administered_by
      FROM appointments a
      LEFT JOIN appointment_vaccines av ON a.id = av.appointment_id
      LEFT JOIN vaccines v ON av.vaccine_id = v.id
      LEFT JOIN administrations ad ON a.id = ad.appointment_id
      LEFT JOIN employees e ON ad.doctor_id = e.id
      LEFT JOIN users doc_user ON e.user_id = doc_user.id
      WHERE a.citizen_id = ${citizenId}
      GROUP BY a.id, doc_user.full_name, ad.dose_number, ad.temperature, ad.blood_pressure, ad.adverse_events, ad.bill_id
      ORDER BY a.scheduled_at DESC
    `;

    res.status(200).json({ citizen: citizenResult[0], appointments });
  } catch (error) {
    console.error("Error searching citizens:", error);
    res.status(500).json({ message: "Internal server error" });
  }

};

export const getBillDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const billDetails = await sql`
      SELECT
        b.id AS bill_id,
        u.full_name,
        string_agg(DISTINCT v.name, ', ' ORDER BY v.name) AS vaccine_names,
        b.amount_cents,
        b.paid,
        b.issued_at AS bill_created_at
      FROM administrations ad
      JOIN bills b ON ad.bill_id = b.id
      JOIN citizens c ON b.citizen_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN vaccines v ON ad.vaccine_id = v.id
      WHERE ad.appointment_id = ${appointmentId}
      GROUP BY b.id, u.full_name, b.amount_cents, b.paid, b.issued_at
      LIMIT 1
    `;

    if (billDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Bill not found for this appointment" });
    }

    res.status(200).json(billDetails[0]);
  } catch (error) {
    console.error("Error retrieving bill details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const billId = await sql`
      SELECT b.id
      FROM bills b
      JOIN administrations ad ON ad.bill_id = b.id
      WHERE ad.appointment_id = ${appointmentId}
    `;

    if (billId.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }
    const updatedBill = await sql`
      UPDATE bills
      SET paid = true, paid_at = NOW()
      WHERE id = ${billId[0].id}
      RETURNING *;
    `;

    if (updatedBill.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({
      message: "Bill payment status updated successfully",
      bill: updatedBill[0],
    });
  } catch (error) {
    console.error("Error updating bill status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
