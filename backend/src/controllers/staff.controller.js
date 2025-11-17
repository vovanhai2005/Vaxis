import { sql } from "../config/db.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
  const { username, email, password, role = "employee" } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already in use." });
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
                INSERT INTO employees (user_id, role_title, active) 
                VALUES (${newUser[0].id}, 'new employee', TRUE)
            `;
    }

    generateToken(newUser[0].id, res);

    res.status(201).json({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      role: newUser[0].role,
    });
  } catch (error) {
    console.error("Error during create Employee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const { fullname, nationalId, email, phoneNumber } = req.body;

    const userId = await sql`
      SELECT user_id 
      FROM employees 
      WHERE id = ${employeeId}
    `;

    if (userId.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Update users table
    await sql`
      UPDATE users 
      SET full_name = ${fullname}, email = ${email}, phone = ${phoneNumber}, updated_at = NOW() 
      WHERE id = ${userId[0].user_id} AND role IN ('employee')
    `;

    // Update employees table
    await sql`
      UPDATE employees 
      SET national_id = ${nationalId}
      WHERE user_id = ${userId[0].user_id}
    `;

    res.status(200).json({ message: "Employee profile updated successfully." });
  } catch (error) {
    console.error("Error updating employee profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStaffList = async (req, res) => {
  try {
    const staffList = await sql`
      SELECT id, username, full_name, role, created_at
      FROM users
      WHERE role IN ('employee', 'manager')
      ORDER BY role
    `;

    res.status(200).json(staffList);
  } catch (error) {
    console.error("Error fetching staff list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id: employeeId } = req.params;

    const userId = await sql`
      SELECT user_id 
      FROM employees 
      WHERE id = ${employeeId}
    `;
    const deletedEmployee = await sql`
      UPDATE employees
      SET active = FALSE
      WHERE user_id = ${userId[0].user_id}
      RETURNING *
    `;

    if (deletedEmployee.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Employee deleted successfully.",
      employee: deletedEmployee[0],
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
