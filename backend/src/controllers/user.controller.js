import { sql } from "../config/db.js";
import cloudinary from '../lib/cloudinary.js';

export const getCitizenProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const userProfile = await sql`
            SELECT 
                u.full_name, 
                u.email, 
                u.phone, 
                u.dob,
                u.profile_picture,
                c.address,
                c.blood_type,
                c.gender,
                c.national_id
            FROM users u
            LEFT JOIN citizens c ON u.id = c.user_id
            WHERE u.id = ${userId}
        `;

        if (userProfile.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(userProfile[0]);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCitizenProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullname, email, phone, dob, address, bloodType, gender, national_id, profilePicture } = req.body;

        let profilePictureUrl = null;
        if (profilePicture) {
            const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
                resource_type: 'auto',
                type: 'upload'
            });
            profilePictureUrl = uploadResponse.secure_url;
        }

        await sql.begin(async (sql) => {
            const userFieldsToUpdate = {};
            if (fullname !== undefined) userFieldsToUpdate.full_name = fullname;
            if (email !== undefined) userFieldsToUpdate.email = email;
            if (phone !== undefined) userFieldsToUpdate.phone = phone;
            if (dob !== undefined) userFieldsToUpdate.dob = dob;
            if (profilePictureUrl) userFieldsToUpdate.profile_picture = profilePictureUrl;

            const citizenFieldsToUpdate = {};
            if (address !== undefined) citizenFieldsToUpdate.address = address;
            if (bloodType !== undefined) citizenFieldsToUpdate.blood_type = bloodType;
            if (gender !== undefined) citizenFieldsToUpdate.gender = gender;
            if (national_id !== undefined) citizenFieldsToUpdate.national_id = national_id;

            if (Object.keys(userFieldsToUpdate).length > 0) {
                userFieldsToUpdate.updated_at = new Date();
                await sql`
                    UPDATE users
                    SET ${sql(userFieldsToUpdate)}
                    WHERE id = ${userId}
                `;
            }

            if (Object.keys(citizenFieldsToUpdate).length > 0) {
                await sql`
                    UPDATE citizens
                    SET ${sql(citizenFieldsToUpdate)}
                    WHERE user_id = ${userId}
                `;
            }
        });

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVaccineHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const citizenResult = await sql`
            SELECT id FROM citizens WHERE user_id = ${userId}
        `;

        if (citizenResult.length === 0) {
            return res.status(404).json({ message: "Citizen profile not found for this user." });
        }
        const citizenId = citizenResult[0].id;

        const history = await sql`
            SELECT 
                v.name as vaccine_name,
                v.manufacturer,
                a.administered_at,
                a.dose_number
            FROM administrations a
            JOIN vaccines v ON a.vaccine_id = v.id
            WHERE a.citizen_id = ${citizenId}
            ORDER BY a.administered_at DESC
        `;

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching vaccine history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const citizenResult = await sql`
            SELECT id FROM citizens WHERE user_id = ${userId}
        `;

        if (citizenResult.length === 0) {
            return res.status(404).json({ message: "Citizen profile not found for this user." });
        }
        const citizenId = citizenResult[0].id;

        const notifications = await sql`
            SELECT
                id,
                type,
                subject,
                body,
                sent_at,
                created_at,
                delivered
            FROM notifications
            WHERE citizen_id = ${citizenId}
            ORDER BY created_at DESC
        `;

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
