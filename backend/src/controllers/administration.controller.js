import { sql } from "../config/db.js";

export const createAdministration = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doseNumber, adverseEvents } = req.body;

    // Validate required fields
    if (!appointmentId || doseNumber == null) {
      return res.status(400).json({
        message: "appointmentId and doseNumber are required",
      });
    }

    // Step 1: Update administration record
    const administration = await sql`
      UPDATE administrations
      SET dose_number = ${doseNumber}, adverse_events = ${adverseEvents}, administered_at = NOW()
      WHERE appointment_id = ${appointmentId}
      RETURNING *;
    `;

    if (administration.length === 0) {
      return res
        .status(404)
        .json({ message: "Administration record not found" });
    }

    // Step 2: Update appointment status to administered
    const status = await sql`
      UPDATE appointments
      SET status = 'administered', updated_at = NOW()
      WHERE id = ${appointmentId}
      RETURNING *;
    `;

    // Step 2.5: Get citizen user_id for notification
    const appointmentData = await sql`
      SELECT a.citizen_id, c.user_id, u.full_name, v.name as vaccine_name
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
      const citizenName = appointmentData[0].full_name;
      const vaccineName = appointmentData[0].vaccine_name || 'vaccination';
      
      // Create notification for citizen
      await sql`
        INSERT INTO notifications (user_id, type, title, message, related_id)
        VALUES (
          ${citizenUserId}, 
          'appointment', 
          'Vaccination Administered',
          ${`Your ${vaccineName} vaccination has been administered. Please proceed to payment to complete your appointment.`},
          ${appointmentId}
        )
      `;
    }

    // Step 3: Get vaccine details from appointment
    const vaccineDetails = await sql`
      SELECT DISTINCT ON (av.vaccine_id)
        av.vaccine_id,
        vl.id AS vaccine_lot_id,
        vl.quantity
      FROM appointment_vaccines av
      JOIN vaccine_lots vl ON av.vaccine_id = vl.vaccine_id
      WHERE av.appointment_id = ${appointmentId} AND vl.quantity > 0
      ORDER BY av.vaccine_id, vl.quantity;
    `;

    if (vaccineDetails.length > 0) {
      // Step 4: Decrement vaccine quantity for each vaccine in the appointment
      const updateQueries = vaccineDetails.map(
        (v) => sql`
          UPDATE vaccine_lots
          SET quantity = quantity - 1
          WHERE vaccine_lots.id = ${v.vaccine_lot_id} AND quantity > 0
          RETURNING id, quantity;
        `
      );

      await Promise.all(updateQueries);
    }

    // Step 5: Create bill
    const billingCitizenData = await sql`
      SELECT citizen_id FROM appointments WHERE id = ${appointmentId}
    `;

    // SỬA: Lấy citizen_id từ biến mới
    if (billingCitizenData.length === 0) {
        return res.status(404).json({ message: "Appointment not found for billing" });
    }
    const citizenId = billingCitizenData[0].citizen_id;

    const details = await sql`
      SELECT v.price
      FROM appointment_vaccines av
      JOIN vaccines v ON av.vaccine_id = v.id
      WHERE av.appointment_id = ${appointmentId}
    `;

    let totalAmount = 0;
    details.forEach((item) => {
      const priceStr = String(item.price).replace(/[^0-9.]/g, "");
      const priceNum = parseFloat(priceStr);

      if (!isNaN(priceNum)) {
        totalAmount += Math.round(priceNum * 100);
      }
    });

    const bill = await sql`
      INSERT INTO bills (citizen_id, amount_cents, paid, issued_at)
      VALUES (${citizenId}, ${totalAmount}, false, NOW())
      RETURNING *;
    `;

    await sql`
      UPDATE administrations
      SET bill_id = ${bill[0].id}
      WHERE appointment_id = ${appointmentId};
    `;

    res.status(201).json({
      message: "Administration created successfully",
      administration: administration[0],
      appointmentStatus: status[0].status,
      bill: bill[0].amount_cents,
    });
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
                u.dob as dob,
                u.phone,
                c.address,
                c.gender,
                c.blood_type,
                string_agg(v.name, ', ') AS vaccine_names,
                scheduled_at,
                status,
                notes,
                ad.dose_number,
                ad.temperature,
                ad.blood_pressure,
                ad.adverse_events,
                ad.bill_id
            FROM appointments a
            JOIN citizens c ON a.citizen_id = c.id
            LEFT JOIN administrations ad ON a.id = ad.appointment_id
            JOIN users u ON c.user_id = u.id
            LEFT JOIN vaccines v ON ad.vaccine_id = v.id
            WHERE c.national_id = ${nationalId}
            GROUP BY full_name, scheduled_at, status, notes, ad.dose_number, ad.temperature,
            ad.adverse_events, ad.bill_id, c.address, c.gender, dob, u.phone, c.blood_type, ad.blood_pressure
            ORDER BY scheduled_at DESC
        `;

    res.status(200).json(results);
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
