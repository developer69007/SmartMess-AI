// controllers/complaintController.js
// Student raises complaints. Admin updates status and responds using Supabase.

const supabase = require("../config/supabaseClient");
const Complaint = require("../models/Complaint");

const formatComplaint = (c) => {
  if (!c) return null;
  return {
    ...c,
    _id: c.id,
    student: c.students ? { ...c.students, _id: c.student_id } : c.student_id,
    studentName: c.student_name || c.studentName || '',
    resolvedBy: c.admins ? { ...c.admins, _id: c.resolved_by } : c.resolved_by,
    resolvedAt: c.resolved_at || c.resolvedAt,
    createdAt: c.created_at || c.createdAt,
    updatedAt: c.updated_at || c.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/complaints — Raise a new complaint (Student only)
// ---------------------------------------------------------------------------
const raiseComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const { data: complaint, error } = await supabase
      .from(Complaint.TABLE_NAME)
      .insert({
        student_id: req.user.id || req.user._id,
        student_name: req.user.name || "Student",
        title: title.trim(),
        description: description.trim(),
        category: category || "other",
        priority: priority || "medium",
        status: "open",
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: formatComplaint(complaint),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/complaints/my — Student's own complaints
// ---------------------------------------------------------------------------
const getMyComplaints = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const { data: complaints, error } = await supabase
      .from(Complaint.TABLE_NAME)
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (complaints || []).map(formatComplaint);
    res.status(200).json({
      success: true,
      count: formatted.length,
      complaints: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/complaints — All complaints (Admin only)
// ---------------------------------------------------------------------------
const getAllComplaints = async (req, res) => {
  try {
    let query = supabase
      .from(Complaint.TABLE_NAME)
      .select("*, students(name, email), admins(name, email)")
      .order("created_at", { ascending: false });

    if (req.query.status) query = query.eq("status", req.query.status);
    if (req.query.priority) query = query.eq("priority", req.query.priority);
    if (req.query.category) query = query.eq("category", req.query.category);

    const [{ data: complaints, error }, openRes, inProgRes, resolvedRes, closedRes] =
      await Promise.all([
        query,
        supabase.from(Complaint.TABLE_NAME).select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from(Complaint.TABLE_NAME).select("id", { count: "exact", head: true }).eq("status", "in-progress"),
        supabase.from(Complaint.TABLE_NAME).select("id", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from(Complaint.TABLE_NAME).select("id", { count: "exact", head: true }).eq("status", "closed"),
      ]);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (complaints || []).map(formatComplaint);

    const summary = {
      open: openRes.count || 0,
      inProgress: inProgRes.count || 0,
      resolved: resolvedRes.count || 0,
      closed: closedRes.count || 0,
    };

    res.status(200).json({
      success: true,
      count: formatted.length,
      summary,
      complaints: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/complaints/:id — Update status/response (Admin only)
// ---------------------------------------------------------------------------
const updateComplaint = async (req, res) => {
  try {
    const { status, response } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (response !== undefined) updateData.response = response;

    if (status === "resolved" || status === "closed") {
      updateData.resolved_by = req.user.id || req.user._id;
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: complaint, error } = await supabase
      .from(Complaint.TABLE_NAME)
      .update(updateData)
      .eq("id", req.params.id)
      .select("*, students(name, email)")
      .maybeSingle();

    if (error || !complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint: formatComplaint(complaint),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/complaints/:id — Delete a complaint (Admin only)
// ---------------------------------------------------------------------------
const deleteComplaint = async (req, res) => {
  try {
    const { data: complaint, error } = await supabase
      .from(Complaint.TABLE_NAME)
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error || !complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  raiseComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  deleteComplaint,
};
