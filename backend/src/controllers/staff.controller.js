import { sql } from "../config/db.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
  // Destructuring dữ liệu gửi lên
  const { 
    full_name, 
    username,
    password, 
    email, 
    phone, 
    national_id,
    role_title, 
    employee_number, 
    dob, 
    role = "employee" 
  } = req.body;

  try {
    // Validate
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }
	const formattedDob = dob === "" ? null : dob;
    const formattedPhone = phone === "" ? null : phone;
    const formattedNationalId = national_id === "" ? null : national_id;
    const formattedEmployeeNumber = employee_number === "" ? null : employee_number;
    const formattedRoleTitle = role_title === "" ? null : role_title;
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check email tồn tại
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    // Check username tồn tại
    const existingUsername = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (existingUsername.length > 0) {
      return res.status(400).json({ message: "Username is already taken." });
    }

	const existingEmployeeNumber = await sql`SELECT * FROM employees WHERE employee_number = ${employee_number}`;
    if (existingEmployeeNumber.length > 0) {
      return res.status(400).json({ message: "Staff ID is already taken." });
    }
	
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. INSERT USERS (Đã sửa cho khớp cột và giá trị)
    const newUser = await sql`
      INSERT INTO users (
        full_name, 
        username, 
        email, 
        password_hash, 
        role, 
        phone, 
        dob
      ) 
      VALUES (
        ${full_name}, 
        ${username}, 
        ${email}, 
        ${hashedPassword}, 
        ${role}::role_type, 
        ${formattedPhone}, 
        ${formattedDob}
      ) 
      RETURNING id, username, email, role, full_name
    `;

    // 2. INSERT EMPLOYEES
   if (newUser.length > 0) {
      await sql`
        INSERT INTO employees (
          user_id, 
          role_title, 
          employee_number, 
          national_id, 
          active
        ) 
        VALUES (
          ${newUser[0].id}, 
          ${formattedRoleTitle}, 
          ${formattedEmployeeNumber}, 
          ${formattedNationalId}, 
          TRUE
        )
      `;
    }

    //generateToken(newUser[0].id, res);

    res.status(201).json({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      role: newUser[0].role,
      message: "Employee created successfully"
    });

  } catch (error) {
    console.error("Error during create Employee:", error);
    // Bắt lỗi trùng lặp (nếu employee_number hoặc national_id trùng)
    if (error.code === '23505') {
       return res.status(400).json({ message: "Duplicate data: Email, Username, Employee ID or National ID already exists." });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    // Lấy UUID từ URL (Frontend gửi user_id lên đây)
    const { id: userId } = req.params; 
    // Lấy dữ liệu cần sửa từ Body
    const { fullname, nationalId, email, phoneNumber, roleTitle, dob } = req.body; 

    // Kiểm tra tính hợp lệ của UUID
    if (!userId || userId.length < 30) { 
        return res.status(400).json({ message: "Invalid User ID format." });
    }

	const formattedDob = dob === "" ? null : dob;
    const formattedPhone = phoneNumber === "" ? null : phoneNumber;
    const formattedNationalId = nationalId === "" ? null : nationalId;
    const formattedRoleTitle = roleTitle === "" ? null : roleTitle;

    // 1. Update bảng USERS
    await sql`
      UPDATE users 
      SET 
        full_name = ${fullname}, 
        email = ${email}, 
        phone = ${formattedPhone}, 
        dob = ${formattedDob}, 
        updated_at = NOW() 
      WHERE id = ${userId}
    `;

    // 2. Update bảng EMPLOYEES
  const updateResult = await sql`
      UPDATE employees 
      SET 
        national_id = ${formattedNationalId},
        role_title = ${formattedRoleTitle}
      WHERE user_id = ${userId}
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
      SELECT 
        e.id,
        u.id as user_id,
        e.employee_number,
        u.full_name,
        u.username,
        u.email,
        u.phone,
        u.dob,
        u.role,
        e.role_title,
        e.national_id,
        COALESCE(e.active, TRUE) as active, 
        u.created_at
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.role IN ('employee', 'manager') 
      ORDER BY 
        CASE WHEN u.role = 'manager' THEN 1 ELSE 2 END, -- Manager lên đầu
        e.active DESC, -- Active = True lên trước
        u.created_at DESC
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

export const restoreEmployee = async (req, res) => {
  try {
    const { id: employeeId } = req.params;

    // Log kiểm tra xem ID có vào được đây không
    console.log("--- START RESTORE --- ID:", employeeId);

    // BƯỚC 1: Lấy user_id giống hệt hàm Delete
    const userResult = await sql`
      SELECT user_id 
      FROM employees 
      WHERE id = ${employeeId}
    `;
    
    // Kiểm tra nếu không tìm thấy ID
    if (!userResult || userResult.length === 0) {
        console.log("Lỗi: Không tìm thấy nhân viên với ID này");
        return res.status(404).json({ message: "Employee not found." });
    }

    const userId = userResult[0].user_id;
    console.log("Found UserID:", userId);

    // BƯỚC 2: Update Active = TRUE (dựa trên user_id)
    const restoredEmployee = await sql`
      UPDATE employees
      SET active = true
      WHERE user_id = ${userId}
      RETURNING *
    `;

    // Kiểm tra kết quả update
    if (restoredEmployee.length === 0) {
      return res.status(404).json({ message: "Update failed (User not found via user_id)." });
    }

    // Thành công
    res.status(200).json({
      message: "Employee restored successfully.",
      employee: restoredEmployee[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};