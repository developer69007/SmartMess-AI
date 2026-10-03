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
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: students, error } = await query;

    if (error) {
      console.error('[Admin Students] Supabase error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    let filtered = students || [];
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(
        (st) =>
          st.name?.toLowerCase().includes(s) ||
          st.email?.toLowerCase().includes(s) ||
          st.registration_number?.toLowerCase().includes(s) ||
          st.registrationNumber?.toLowerCase().includes(s)
      );
    }

    const formatted = filtered.map((s) => {
      const { password, ...rest } = s;
      return {
        ...rest,
        _id: rest.id,
        registrationNumber: rest.registration_number || rest.registrationNumber || '',
        emailSent: rest.email_sent !== undefined ? rest.email_sent : rest.emailSent || false,
        emailStatus: rest.email_status || rest.emailStatus || 'pending',
        createdAt: rest.created_at || rest.createdAt || new Date().toISOString(),
        updatedAt: rest.updated_at || rest.updatedAt || new Date().toISOString(),
      };
    });

    res.status(200).json({ success: true, count: formatted.length, students: formatted });
  } catch (error) {
    console.error('[Admin Students] Server error:', error.message);
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