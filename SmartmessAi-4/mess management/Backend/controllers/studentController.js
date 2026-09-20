// controllers/studentController.js
// Handles student registration, login (Firebase bridge), profile, email triggers, and CRUD using Supabase.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const Student = require('../models/Student');
const emailService = require('../services/emailService');

// Helper to normalize id/_id and camelCase fields in student object
const formatStudent = (student) => {
  if (!student) return null;
  const { password, ...rest } = student;
  return {
    ...rest,
    _id: rest.id,
    registrationNumber: rest.registration_number || rest.registrationNumber || '',
    emailSent: rest.email_sent !== undefined ? rest.email_sent : rest.emailSent,
    emailSentAt: rest.email_sent_at || rest.emailSentAt,
    emailStatus: rest.email_status || rest.emailStatus || 'pending',
    createdAt: rest.created_at || rest.createdAt,
    updatedAt: rest.updated_at || rest.updatedAt,
  };
};

// -----------------------------------------------------------------------------
// POST /api/students — Create / register a student (Admin & Sign-up)
// -----------------------------------------------------------------------------
const createStudent = async (req, res) => {
  try {
    const { name, email, password, registrationNumber, registration_number } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const regNo = (registrationNumber || registration_number || '').trim();
    const studentPassword = password ? password.trim() : 'password123';

    // 1. Check for duplicate email
    const { data: existingStudent } = await supabase
      .from(Student.TABLE_NAME)
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'A student with this email already exists',
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

    // 3. Insert student record
    let newStudentData = null;
    
    // Try insert with extended fields (registration_number, email_status)
    const extendedPayload = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: 'student',
    };
    if (regNo) extendedPayload.registration_number = regNo;

    let { data: student, error: insertError } = await supabase
      .from(Student.TABLE_NAME)
      .insert(extendedPayload)
      .select('*')
      .single();

    // If extended columns do not exist yet in schema, fall back to core schema
    if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('column'))) {
      const fallbackPayload = {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: 'student',
      };
      const retry = await supabase
        .from(Student.TABLE_NAME)
        .insert(fallbackPayload)
        .select('*')
        .single();
      
      if (retry.error) {
        return res.status(500).json({ success: false, message: retry.error.message });
      }
      newStudentData = retry.data;
    } else if (insertError) {
      return res.status(500).json({ success: false, message: insertError.message });
    } else {
      newStudentData = student;
    }

    // 4. Trigger Welcome Email
    let emailResult = { success: false, simulated: false };
    try {
      emailResult = await emailService.sendWelcomeEmail({
        name: cleanName,
        email: cleanEmail,
        registrationNumber: regNo,
      });

      // Update email delivery status in DB if column exists
      if (newStudentData && emailResult.success) {
        await supabase
          .from(Student.TABLE_NAME)
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            email_status: emailResult.simulated ? 'simulated' : 'sent',
          })
          .eq('id', newStudentData.id);
      }
    } catch (mailErr) {
      console.error('[Student Creation] Email dispatch failed:', mailErr.message);
    }

    const formatted = formatStudent(newStudentData);
    if (regNo) formatted.registrationNumber = regNo;

    if (emailResult.success) {
      return res.status(201).json({
        success: true,
        message: emailResult.simulated
          ? 'Student created successfully (Welcome email simulated in development).'
          : 'Student created successfully and welcome email sent!',
        emailSent: !emailResult.simulated,
        emailMessage: emailResult.message,
        student: formatted,
      });
    }

    // Student created successfully, but email failed
    return res.status(201).json({
      success: true,
      message: 'Student created successfully, but welcome email could not be sent.',
      emailSent: false,
      emailMessage: 'Welcome email delivery failed: ' + (emailResult.error || 'Provider uncontactable'),
      student: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/students/login — Student login with email OR registration number
// -----------------------------------------------------------------------------
const loginStudent = async (req, res) => {
  try {
    const { email, password, identifier } = req.body;
    const inputIdentifier = (identifier || email || '').trim();

    if (!inputIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email / Registration Number and password are required',
      });
    }

    const cleanInput = inputIdentifier.toLowerCase();

    // 1. Search student by email (case-insensitive)
    let { data: student } = await supabase
      .from(Student.TABLE_NAME)
      .select('*')
      .ilike('email', cleanInput)
      .maybeSingle();

    // 2. If not found by email, try matching by registration_number
    if (!student) {
      try {
        const { data: byReg, error: regError } = await supabase
          .from(Student.TABLE_NAME)
          .select('*')
          .ilike('registration_number', cleanInput)
          .maybeSingle();
        if (!regError && byReg) student = byReg;
      } catch {
        // registration_number column may not exist yet — skip gracefully
      }
    }

    // Diagnostic log without leaking credentials
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Student Auth] Attempt for: "${cleanInput}" | Found in DB: ${Boolean(student)}`);
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email or registration number.',
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password.trim(), student.password);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Student Auth] Password match: ${isMatch}`);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: student.id, role: student.role || 'student', model: 'Student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      student: formatStudent(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/students/firebase-login — Bridge: Firebase UID → Backend JWT
// -----------------------------------------------------------------------------
const firebaseAuthBridge = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let { data: student } = await supabase
      .from(Student.TABLE_NAME)
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!student) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const { data: newStudent, error: insertError } = await supabase
        .from(Student.TABLE_NAME)
        .insert({
          name: name ? name.trim() : cleanEmail.split('@')[0],
          email: cleanEmail,
          password: randomPassword,
          role: 'student',
        })
        .select('*')
        .single();

      if (insertError) {
        return res.status(500).json({ success: false, message: insertError.message });
      }
      student = newStudent;
    }

    const token = jwt.sign(
      { id: student.id, role: student.role || 'student', model: 'Student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      student: formatStudent(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/students — Get all students (staff/admin only)
// -----------------------------------------------------------------------------
const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from(Student.TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (students || []).map(formatStudent);
    res.status(200).json({ success: true, count: formatted.length, students: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/students/:id — Get one student by ID (staff/admin only)
// -----------------------------------------------------------------------------
const getStudentById = async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from(Student.TABLE_NAME)
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, student: formatStudent(student) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/students/profile — Get the logged-in student's own profile
// -----------------------------------------------------------------------------
const getProfile = async (req, res) => {
  res.status(200).json({ success: true, student: formatStudent(req.user) });
};

// -----------------------------------------------------------------------------
// PUT /api/students/:id — Update a student (admin only)
// -----------------------------------------------------------------------------
const updateStudent = async (req, res) => {
  try {
    const { name, email, registrationNumber, registration_number } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    const reg = registrationNumber || registration_number;
    if (reg) updateData.registration_number = reg.trim();

    let { data: student, error } = await supabase
      .from(Student.TABLE_NAME)
      .update(updateData)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    // If registration_number column does not exist yet, retry with only standard fields
    if (error && error.message?.includes('column')) {
      delete updateData.registration_number;
      const retry = await supabase
        .from(Student.TABLE_NAME)
        .update(updateData)
        .eq('id', req.params.id)
        .select('*')
        .maybeSingle();
      student = retry.data;
      error = retry.error;
    }

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, student: formatStudent(student) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/students/:id — Delete a student (admin only)
// -----------------------------------------------------------------------------
const deleteStudent = async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from(Student.TABLE_NAME)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createStudent,
  loginStudent,
  firebaseAuthBridge,
  getAllStudents,
  getStudentById,
  getProfile,
  updateStudent,
  deleteStudent,
};