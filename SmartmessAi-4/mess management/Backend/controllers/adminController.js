// controllers/adminController.js
// Admin authentication, profile, and role/student/staff management using Supabase.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

// Helper to format admin response
const formatAdmin = (admin) => {
  if (!admin) return null;
  const { password, ...rest } = admin;
  return {
    ...rest,
    _id: rest.id,
    profileImage: rest.profile_image || rest.profileImage || '',
    isActive: rest.is_active !== undefined ? rest.is_active : rest.isActive,
    lastLogin: rest.last_login || rest.lastLogin || null,
    createdAt: rest.created_at || rest.createdAt,
    updatedAt: rest.updated_at || rest.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/admin/login
// ---------------------------------------------------------------------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: admin, error } = await supabase
      .from(Admin.TABLE_NAME)
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isActive = admin.is_active !== undefined ? admin.is_active : admin.isActive;
    if (isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This admin account is deactivated',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const now = new Date().toISOString();
    await supabase
      .from(Admin.TABLE_NAME)
      .update({ last_login: now })
      .eq('id', admin.id);

    admin.last_login = now;

    const token = jwt.sign(
      { id: admin.id, role: 'admin', model: 'Admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: formatAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/profile — Admin's own profile
// ---------------------------------------------------------------------------
const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: formatAdmin(req.user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/admin/profile — Update admin's own profile
// ---------------------------------------------------------------------------
const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    const { data: admin, error } = await supabase
      .from(Admin.TABLE_NAME)
      .update(updateData)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, user: formatAdmin(admin) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/admin/students/:id/role — Change a student's role
// ---------------------------------------------------------------------------
const updateStudentRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ['student', 'staff', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    const { data: student, error } = await supabase
      .from(Student.TABLE_NAME)
      .update({ role })
      .eq('id', req.params.id)
      .select('id, name, email, role, created_at, updated_at')
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      student: { ...student, _id: student.id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/students — Get all students (admin view)
// ---------------------------------------------------------------------------
const getAllStudentsAdmin = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = supabase
      .from(Student.TABLE_NAME)
      .select('id, name, email, role, registration_number, email_sent, email_sent_at, email_status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,registration_number.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }

    let { data: students, error } = await query;

    // Fallback if extended columns are missing
    if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
      const retryQuery = supabase
        .from(Student.TABLE_NAME)
        .select('id, name, email, role, created_at, updated_at')
        .order('created_at', { ascending: false });
      const retryRes = await retryQuery;
      students = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (students || []).map((s) => ({
      ...s,
      _id: s.id,
      registrationNumber: s.registration_number || '',
      emailSent: s.email_sent || false,
      emailStatus: s.email_status || 'not_sent',
    }));
    res.status(200).json({ success: true, count: formatted.length, students: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/overview — Quick counts for admin dashboard header
// ---------------------------------------------------------------------------
const getAdminOverview = async (req, res) => {
  try {
    const [studentsRes, staffRes, adminsRes] = await Promise.all([
      supabase.from(Student.TABLE_NAME).select('id', { count: 'exact', head: true }),
      supabase.from(Staff.TABLE_NAME).select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from(Admin.TABLE_NAME).select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const totalStudents = studentsRes.count || 0;
    const totalStaff = staffRes.count || 0;
    const totalAdmins = adminsRes.count || 0;

    res.status(200).json({
      success: true,
      overview: { totalStudents, totalStaff, totalAdmins },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  updateStudentRole,
  getAllStudentsAdmin,
  getAdminOverview,
};