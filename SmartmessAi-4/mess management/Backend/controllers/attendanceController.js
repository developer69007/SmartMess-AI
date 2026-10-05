// controllers/attendanceController.js
// QR-based attendance for students using Supabase.

const supabase = require("../config/supabaseClient");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const MessMenu = require("../models/MessMenu");
const emailService = require("../services/emailService");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

const formatAttendance = (rec) => {
  if (!rec) return null;
  return {
    ...rec,
    _id: rec.id,
    student: rec.students ? { ...rec.students, _id: rec.student_id } : rec.student_id,
    mealType: rec.meal_type || rec.mealType,
    qrToken: rec.qr_token || rec.qrToken || '',
    verifiedBy: rec.verified_by || rec.verifiedBy,
    createdAt: rec.created_at || rec.createdAt,
    updatedAt: rec.updated_at || rec.updatedAt,
  };
};

// Helper to fetch today's menu for email notification
const fetchTodaysMenu = async () => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from(MessMenu.TABLE_NAME)
      .select("*")
      .eq("date", todayStr)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// POST /api/attendance/scan — Mark attendance via QR (Student self-mark)
// ---------------------------------------------------------------------------
const markAttendance = async (req, res) => {
  try {
    const { mealType, qrToken } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: "Meal type is required (breakfast/lunch/dinner)",
      });
    }

    // Anti-proxy validation: If a QR token is supplied, verify it belongs strictly to this logged-in student
    if (qrToken) {
      try {
        const decoded = Buffer.from(qrToken, "base64").toString("utf8");
        const parts = decoded.split("_");
        const tokenStudentId = parts[0];
        if (tokenStudentId && tokenStudentId !== String(studentId)) {
          return res.status(403).json({
            success: false,
            message: "Security violation: You cannot mark attendance using another student's QR code",
          });
        }
      } catch (err) {
        // Continue if non-base64 or custom string, but studentId is always locked to req.user.id
      }
    }

    const { start, end } = getTodayRange();

    // Check for duplicate attendance
    const { data: existing } = await supabase
      .from(Attendance.TABLE_NAME)
      .select("*")
      .eq("student_id", studentId)
      .gte("date", start)
      .lte("date", end)
      .eq("meal_type", mealType)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `You have already marked attendance for ${mealType} today`,
        attendance: formatAttendance(existing),
      });
    }

    const { data: attendance, error } = await supabase
      .from(Attendance.TABLE_NAME)
      .insert({
        student_id: studentId,
        date: new Date().toISOString(),
        meal_type: mealType,
        qr_token: qrToken || "",
        status: "present",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Attendance already marked for this meal today",
        });
      }
      return res.status(500).json({ success: false, message: error.message });
    }

    // Trigger confirmation email to student + alert email to staff team
    (async () => {
      try {
        const studentObj = req.user;
        const menuData = await fetchTodaysMenu();

        // 1. Send confirmation to student with today's menu
        if (studentObj && studentObj.email) {
          await emailService.sendAttendanceConfirmationEmail({
            name: studentObj.name,
            email: studentObj.email,
            mealType: mealType,
            menu: menuData,
          });
        }

        // 2. Send notification email to staff
        await emailService.sendStaffAttendanceAlertEmail({
          staffEmail: process.env.EMAIL_USER || "staff@smartmess.ai",
          staffName: "Mess Operations Staff",
          studentName: studentObj.name || "Student",
          studentEmail: studentObj.email || "",
          mealType: mealType,
          method: "Student Self-Mark (Mobile/Web)",
          verifiedBy: `Student Self-Verified (${studentObj.name})`,
        });
      } catch (e) {
        console.error("Failed to send attendance emails:", e);
      }
    })();

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${mealType}`,
      attendance: formatAttendance(attendance),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/attendance/my — Student's own attendance history
// ---------------------------------------------------------------------------
const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    const limit = parseInt(req.query.limit) || 30;

    const { data: records, error } = await supabase
      .from(Attendance.TABLE_NAME)
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formattedRecords = (records || []).map(formatAttendance);
    const totalPresent = formattedRecords.filter((r) => r.status === "present").length;
    const percentage =
      formattedRecords.length > 0
        ? Math.round((totalPresent / formattedRecords.length) * 100)
        : 0;

    res.status(200).json({
      success: true,
      count: formattedRecords.length,
      totalPresent,
      attendancePercentage: percentage,
      records: formattedRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/attendance/daily — Today's full attendance report
// ---------------------------------------------------------------------------
const getDailyAttendance = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    let query = supabase
      .from(Attendance.TABLE_NAME)
      .select("*, students(name, email)")
      .gte("date", start)
      .lte("date", end)
      .order("created_at", { ascending: false });

    if (req.query.mealType) {
      query = query.eq("meal_type", req.query.mealType);
    }

    const { data: records, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (records || []).map(formatAttendance);

    const summary = {
      breakfast: formatted.filter((r) => r.mealType === "breakfast").length,
      lunch: formatted.filter((r) => r.mealType === "lunch").length,
      dinner: formatted.filter((r) => r.mealType === "dinner").length,
      total: formatted.length,
    };

    res.status(200).json({
      success: true,
      date: new Date().toDateString(),
      summary,
      count: formatted.length,
      records: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/attendance/analytics — Weekly attendance trend for charts
// ---------------------------------------------------------------------------
const getAttendanceAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const { count: totalStudents } = await supabase
      .from(Student.TABLE_NAME)
      .select("id", { count: "exact", head: true });

    const totalStudentCount = totalStudents || 0;
    const result = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from(Attendance.TABLE_NAME)
        .select("id", { count: "exact", head: true })
        .gte("date", day.toISOString())
        .lte("date", dayEnd.toISOString())
        .eq("status", "present");

      const attendanceCount = count || 0;
      const percentage =
        totalStudentCount > 0
          ? Math.round((attendanceCount / totalStudentCount) * 100)
          : 0;

      result.push({
        day: dayNames[day.getDay()],
        date: day.toISOString().split("T")[0],
        count: attendanceCount,
        totalStudents: totalStudentCount,
        percentage,
      });
    }

    res.status(200).json({
      success: true,
      days: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/attendance/verify/:qrToken — Staff verifies a student's QR code
// ---------------------------------------------------------------------------
const verifyQRAttendance = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { mealType } = req.query;

    if (!qrToken || !qrToken.trim()) {
      return res.status(400).json({ success: false, message: "QR token is required" });
    }

    const rawToken = qrToken.trim();
    let candidateIdentifiers = [];

    // 1. Try Base64 decoding
    try {
      const decoded = Buffer.from(rawToken, "base64").toString("utf8");
      if (decoded) {
        // Check if JSON
        if (decoded.startsWith("{") && decoded.endsWith("}")) {
          try {
            const parsed = JSON.parse(decoded);
            if (parsed.studentId) candidateIdentifiers.push(parsed.studentId);
            if (parsed.id) candidateIdentifiers.push(parsed.id);
            if (parsed._id) candidateIdentifiers.push(parsed._id);
            if (parsed.email) candidateIdentifiers.push(parsed.email);
            if (parsed.registrationNumber) candidateIdentifiers.push(parsed.registrationNumber);
          } catch (_) {}
        }
        // Split by _ or | or :
        const parts = decoded.split(/[_|:]/);
        if (parts[0]) candidateIdentifiers.push(parts[0]);
        candidateIdentifiers.push(decoded);
      }
    } catch (_) {}

    // 2. Also check raw token as direct ID / Email
    candidateIdentifiers.push(rawToken);
    if (rawToken.includes("_")) candidateIdentifiers.push(rawToken.split("_")[0]);
    if (rawToken.includes("|")) candidateIdentifiers.push(rawToken.split("|")[0]);

    // Deduplicate candidate identifiers
    candidateIdentifiers = [...new Set(candidateIdentifiers.filter(Boolean))];

    // 3. Find student in DB by candidate IDs or emails
    let student = null;
    for (const ident of candidateIdentifiers) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ident);
      if (isUUID) {
        const { data } = await supabase
          .from(Student.TABLE_NAME)
          .select("id, name, email")
          .eq("id", ident)
          .maybeSingle();
        if (data) { student = data; break; }
      }
      if (ident.includes("@")) {
        const { data } = await supabase
          .from(Student.TABLE_NAME)
          .select("id, name, email")
          .ilike("email", ident)
          .maybeSingle();
        if (data) { student = data; break; }
      }
      const { data: byId } = await supabase
        .from(Student.TABLE_NAME)
        .select("id, name, email")
        .eq("id", ident)
        .maybeSingle();
      if (byId) { student = byId; break; }
    }

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found for this QR code" });
    }

    const { start, end } = getTodayRange();
    const effectiveMealType = mealType || "lunch";

    const { data: existing } = await supabase
      .from(Attendance.TABLE_NAME)
      .select("*")
      .eq("student_id", student.id)
      .gte("date", start)
      .lte("date", end)
      .eq("meal_type", effectiveMealType)
      .maybeSingle();

    const formattedStudent = { ...student, _id: student.id };

    if (existing) {
      return res.status(200).json({
        success: true,
        verified: true,
        alreadyMarked: true,
        student: formattedStudent,
        attendance: formatAttendance(existing),
        message: `Attendance was already marked for ${student.name} (${effectiveMealType}) earlier today.`,
      });
    }

    const { data: attendance, error } = await supabase
      .from(Attendance.TABLE_NAME)
      .insert({
        student_id: student.id,
        date: new Date().toISOString(),
        meal_type: effectiveMealType,
        qr_token: rawToken,
        status: "present",
        verified_by: req.user ? (req.user.id || req.user._id) : null,
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Trigger confirmation email to student + alert to staff
    (async () => {
      try {
        const menuData = await fetchTodaysMenu();
        const staffObj = req.user;

        // 1. Send confirmation to student
        if (student && student.email) {
          await emailService.sendAttendanceConfirmationEmail({
            name: student.name,
            email: student.email,
            mealType: effectiveMealType,
            menu: menuData,
          });
        }

        // 2. Send alert to staff member
        const staffEmail = (staffObj && staffObj.email) ? staffObj.email : (process.env.EMAIL_USER || "staff@smartmess.ai");
        const staffName = (staffObj && staffObj.name) ? staffObj.name : "Staff Member";
        await emailService.sendStaffAttendanceAlertEmail({
          staffEmail: staffEmail,
          staffName: staffName,
          studentName: student.name || "Student",
          studentEmail: student.email || "",
          mealType: effectiveMealType,
          method: "Staff Scanner Verification (Camera/Token)",
          verifiedBy: staffName,
        });
      } catch (e) {
        console.error("Failed to send verification confirmation emails:", e);
      }
    })();

    res.status(201).json({
      success: true,
      verified: true,
      alreadyMarked: false,
      student: formattedStudent,
      attendance: formatAttendance(attendance),
      message: `Attendance marked successfully for ${student.name}! Confirmation email sent to ${student.email}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getDailyAttendance,
  getAttendanceAnalytics,
  verifyQRAttendance,
};
