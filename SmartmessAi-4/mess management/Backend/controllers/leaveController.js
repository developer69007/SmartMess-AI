// controllers/leaveController.js
// Student leave requests using Supabase.

const supabase = require("../config/supabaseClient");
const LeaveRequest = require("../models/LeaveRequest");

const formatLeave = (l) => {
  if (!l) return null;
  return {
    ...l,
    _id: l.id,
    student: l.students ? { ...l.students, _id: l.student_id } : l.student_id,
    studentName: l.student_name || l.studentName || '',
    fromDate: l.from_date || l.fromDate,
    toDate: l.to_date || l.toDate,
    mealsToSkip: l.meals_to_skip || l.mealsToSkip || [],
    approvedBy: l.admins ? { ...l.admins, _id: l.approved_by } : l.approved_by,
    approvedAt: l.approved_at || l.approvedAt,
    rejectionReason: l.rejection_reason || l.rejectionReason || '',
    createdAt: l.created_at || l.createdAt,
    updatedAt: l.updated_at || l.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/leave — Apply for mess leave (Student only)
// ---------------------------------------------------------------------------
const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason, mealsToSkip } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, and reason are required",
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be after to date",
      });
    }

    const { data: leave, error } = await supabase
      .from(LeaveRequest.TABLE_NAME)
      .insert({
        student_id: req.user.id || req.user._id,
        student_name: req.user.name || "Student",
        from_date: from.toISOString(),
        to_date: to.toISOString(),
        reason: reason.trim(),
        meals_to_skip: mealsToSkip || ["breakfast", "lunch", "dinner"],
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Leave request submitted. Awaiting admin approval.",
      leave: formatLeave(leave),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/leave/my — Student's own leave requests
// ---------------------------------------------------------------------------
const getMyLeaveRequests = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const { data: leaves, error } = await supabase
      .from(LeaveRequest.TABLE_NAME)
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (leaves || []).map(formatLeave);
    res.status(200).json({ success: true, count: formatted.length, leaves: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/leave — All leave requests (Admin only)
// ---------------------------------------------------------------------------
const getAllLeaveRequests = async (req, res) => {
  try {
    let query = supabase
      .from(LeaveRequest.TABLE_NAME)
      .select("*, students(name, email), admins(name, email)")
      .order("created_at", { ascending: false });

    if (req.query.status) {
      query = query.eq("status", req.query.status);
    }

    const { data: leaves, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (leaves || []).map(formatLeave);
    res.status(200).json({ success: true, count: formatted.length, leaves: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/leave/:id — Approve or reject leave (Admin only)
// ---------------------------------------------------------------------------
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const updateData = {
      status,
      approved_by: req.user.id || req.user._id,
      approved_at: new Date().toISOString(),
    };

    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: leave, error } = await supabase
      .from(LeaveRequest.TABLE_NAME)
      .update(updateData)
      .eq("id", req.params.id)
      .select("*, students(name, email)")
      .maybeSingle();

    if (error || !leave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    res.status(200).json({
      success: true,
      message: `Leave request ${status}`,
      leave: formatLeave(leave),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
};
