import { sql } from '../config/db.js';
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const { username, email, password, role = 'citizen' } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }  

        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await sql`
            INSERT INTO users (username, email, password_hash, role) 
            VALUES (${username}, ${email}, ${hashedPassword}, ${role}::role_type) 
            RETURNING id, username, email, role
        `;
        
        if (newUser.length > 0) {
            await sql`
                INSERT INTO citizens (user_id) 
                VALUES (${newUser[0].id})
            `;
        }

        generateToken(newUser[0].id, res); 

        res.status(201).json({ 
            id: newUser[0].id,
            username: newUser[0].username,
            email: newUser[0].email,
            role: newUser[0].role
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const user = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        generateToken(user[0].id, res);

        res.status(200).json({
            message: 'Login successfully',
            id: user[0].id,
            fullName: user[0].full_name,
            username: user[0].username,
            role: user[0].role
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        // For citizens, check if profile is complete
        if (req.user.role === 'citizen') {
            const citizenData = await sql`
                SELECT c.national_id, u.full_name, u.phone, u.dob
                FROM citizens c
                JOIN users u ON c.user_id = u.id
                WHERE u.id = ${req.user.id}
            `;
            
            const isProfileComplete = citizenData.length > 0 && 
                citizenData[0].national_id && 
                citizenData[0].full_name && 
                citizenData[0].phone && 
                citizenData[0].dob;
            
            return res.status(200).json({
                ...req.user,
                isProfileComplete
            });
        }
        
        res.status(200).json({
            ...req.user,
            isProfileComplete: true
        });
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const completeProfile = async (req, res) => {
    try {
        const { fullName, nationalId, dob, phone } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!fullName || !nationalId || !dob || !phone) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if national ID is already used by another citizen
        const existingCitizen = await sql`
            SELECT c.id FROM citizens c
            JOIN users u ON c.user_id = u.id
            WHERE c.national_id = ${nationalId} AND u.id != ${userId}
        `;
        
        if (existingCitizen.length > 0) {
            return res.status(400).json({ message: 'National ID is already registered to another user.' });
        }

        // Update user table
        await sql`
            UPDATE users
            SET full_name = ${fullName}, phone = ${phone}, dob = ${dob}, updated_at = NOW()
            WHERE id = ${userId}
        `;

        // Update citizen table
        await sql`
            UPDATE citizens
            SET national_id = ${nationalId}
            WHERE user_id = ${userId}
        `;

        res.status(200).json({ message: 'Profile completed successfully.' });
    } catch (error) {
        console.error('Error completing profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};