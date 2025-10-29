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
            return res.status(400).json({ message: 'username and password are required.' });
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

export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, dob } = req.body;
        const userId = req.user.id;

        if (!fullName && !phone && !dob) {
            return res.status(400).json({ message: "No fields to update provided." });
        }

        // Start building the query
        const queryParts = [sql`UPDATE users SET`];
        const values = [];

        if (fullName) {
            queryParts.push(sql`full_name = ${fullName}`);
        }
        if (phone) {
            queryParts.push(sql`phone = ${phone}`);
        }
        if (dob) {
            queryParts.push(sql`dob = ${dob}`);
        }

        // Join the parts with commas
        const setClause = queryParts.slice(1).reduce((prev, curr) => sql`${prev}, ${curr}`);
        
        const finalQuery = sql`
            ${queryParts[0]} ${setClause}, updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, full_name, email, role, phone, dob
        `;

        const updatedUser = await finalQuery;

        if (updatedUser.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(updatedUser[0]);

    } catch (error) {
        console.error('Error during profile update:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
