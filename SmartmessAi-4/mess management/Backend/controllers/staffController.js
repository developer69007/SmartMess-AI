// controllers/staffController.js
// Staff operations: login using staff table, profile, CRUD using Supabase.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const Staff = require("../models/Staff");

const formatStaff = (staff) => {
  if (!staff) return null;
  const { password, ...rest } = staff;
  return {
    ...rest,
    _id: rest.id,
    employeeId: rest.employee_id || rest.employeeId,
    profileImage: rest.profile_image || rest.profileImage || '',
    isActive: rest.is_active !== undefined ? rest.is_active : rest.isActive,
    lastLogin: rest.last_login || rest.lastLogin || null,
    createdAt: rest.created_at || rest.createdAt,
    updatedAt: rest.updated_at || rest.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/staff/login — Staff login
// ---------------------------------------------------------------------------
const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: staff, error } = await supabase
      .from(Staff.TABLE_NAME)
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !staff) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isActive = staff.is_active !== undefined ? staff.is_active : staff.isActive;
    if (isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const now = new Date().toISOString();
    await supabase
      .from(Staff.TABLE_NAME)
      .update({ last_login: now })
      .eq("id", staff.id);

    staff.last_login = now;

    const token = jwt.sign(
      { id: staff.id, role: "staff", model: "Staff" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: formatStaff(staff),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/staff/profile — Staff's own profile
// ---------------------------------------------------------------------------
const getStaffProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: formatStaff(req.user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/staff/profile — Update staff profile
// ---------------------------------------------------------------------------
const updateStaffProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    const { data: staff, error } = await supabase
      .from(Staff.TABLE_NAME)
      .update(updateData)
      .eq("id", req.user.id)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, user: formatStaff(staff) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/staff — Get all staff (Admin only)
// ---------------------------------------------------------------------------
const getAllStaff = async (req, res) => {
  try {
    const { data: staffList, error } = await supabase
      .from(Staff.TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (staffList || []).map(formatStaff);
    res.status(200).json({
      success: true,
      count: formatted.length,
      staff: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/staff — Create new staff member (Admin only)
// ---------------------------------------------------------------------------
const createStaff = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, shift, phone } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and employee ID are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from(Staff.TABLE_NAME)
      .select("id")
      .or(`email.eq.${cleanEmail},employee_id.eq.${employeeId}`)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A staff member with this email or employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: staff, error } = await supabase
      .from(Staff.TABLE_NAME)
      .insert({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        employee_id: employeeId.trim(),
        department: department || "kitchen",
        shift: shift || "morning",
        phone: phone || "",
        role: "staff",
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, staff: formatStaff(staff) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/staff/:id — Update staff (Admin only)
// ---------------------------------------------------------------------------
const updateStaff = async (req, res) => {
  try {
    const { name, email, department, shift, phone, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (department) updateData.department = department;
    if (shift) updateData.shift = shift;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: staff, error } = await supabase
      .from(Staff.TABLE_NAME)
      .update(updateData)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error || !staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    res.status(200).json({ success: true, staff: formatStaff(staff) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/staff/:id — Delete staff (Admin only)
// ---------------------------------------------------------------------------
const deleteStaff = async (req, res) => {
  try {
    const { data: staff, error } = await supabase
      .from(Staff.TABLE_NAME)
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error || !staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    res.status(200).json({ success: true, message: "Staff member removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  staffLogin,
  getStaffProfile,
  updateStaffProfile,
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
