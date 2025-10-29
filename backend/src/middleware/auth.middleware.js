import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const users = await sql`
            SELECT id, full_name, email, role 
            FROM users 
            WHERE id = ${decoded.userId}
        `;

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = users[0];
        next();
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}