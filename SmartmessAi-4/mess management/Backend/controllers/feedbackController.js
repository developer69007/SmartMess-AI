// controllers/feedbackController.js
// Student feedback on meals using Supabase.

const supabase = require("../config/supabaseClient");
const Feedback = require("../models/Feedback");

const formatFeedback = (f) => {
  if (!f) return null;
  return {
    ...f,
    _id: f.id,
    student: f.students ? { ...f.students, _id: f.student_id } : f.student_id,
    studentName: f.student_name || f.studentName || '',
    mealType: f.meal_type || f.mealType,
    mealItems: f.meal_items || f.mealItems || '',
    createdAt: f.created_at || f.createdAt,
    updatedAt: f.updated_at || f.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/feedback — Submit feedback (Student only)
// ---------------------------------------------------------------------------
const submitFeedback = async (req, res) => {
  try {
    const { mealType, rating, comment, mealItems } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!mealType || !rating) {
      return res.status(400).json({
        success: false,
        message: "Meal type and rating are required",
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const sentiment = Feedback.computeSentiment(numRating);

    const { data: feedback, error } = await supabase
      .from(Feedback.TABLE_NAME)
      .insert({
        student_id: studentId,
        student_name: req.user.name || "Student",
        meal_type: mealType,
        rating: numRating,
        comment: comment || "",
        meal_items: mealItems || "",
        sentiment,
        date: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. Thank you!",
      feedback: formatFeedback(feedback),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/feedback/my — Student's own feedback history
// ---------------------------------------------------------------------------
const getMyFeedback = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const { data: feedbacks, error } = await supabase
      .from(Feedback.TABLE_NAME)
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (feedbacks || []).map(formatFeedback);
    const avgRating =
      formatted.length > 0
        ? (formatted.reduce((sum, f) => sum + f.rating, 0) / formatted.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      count: formatted.length,
      averageRating: avgRating,
      feedbacks: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/feedback — Get all feedback (Admin/Staff)
// ---------------------------------------------------------------------------
const getAllFeedback = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    let query = supabase
      .from(Feedback.TABLE_NAME)
      .select("*, students(name, email)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (req.query.sentiment) query = query.eq("sentiment", req.query.sentiment);
    if (req.query.mealType) query = query.eq("meal_type", req.query.mealType);

    const { data: feedbacks, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (feedbacks || []).map(formatFeedback);
    res.status(200).json({ success: true, count: formatted.length, feedbacks: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/feedback/analytics — Sentiment breakdown for admin analytics
// ---------------------------------------------------------------------------
const getFeedbackAnalytics = async (req, res) => {
  try {
    const { data: allFeedback, error } = await supabase
      .from(Feedback.TABLE_NAME)
      .select("sentiment, meal_type, rating");

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const items = allFeedback || [];
    const totalFeedback = items.length;
    const avgRating =
      totalFeedback > 0
        ? Number((items.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(1))
        : 0;

    // Group by sentiment
    const sentimentMap = {};
    items.forEach((f) => {
      const s = f.sentiment || "Neutral";
      if (!sentimentMap[s]) sentimentMap[s] = { _id: s, count: 0, sumRating: 0 };
      sentimentMap[s].count++;
      sentimentMap[s].sumRating += f.rating;
    });
    const sentimentCounts = Object.values(sentimentMap).map((g) => ({
      _id: g._id,
      count: g.count,
      avgRating: g.count > 0 ? Number((g.sumRating / g.count).toFixed(1)) : 0,
    }));

    // Group by mealType
    const mealMap = {};
    items.forEach((f) => {
      const m = f.meal_type || "lunch";
      if (!mealMap[m]) mealMap[m] = { _id: m, count: 0, sumRating: 0 };
      mealMap[m].count++;
      mealMap[m].sumRating += f.rating;
    });
    const mealTypeCounts = Object.values(mealMap).map((g) => ({
      _id: g._id,
      count: g.count,
      avgRating: g.count > 0 ? Number((g.sumRating / g.count).toFixed(1)) : 0,
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalFeedback,
        averageRating: avgRating,
        ratingOutOf: 5,
        bysentiment: sentimentCounts,
        byMealType: mealTypeCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/feedback/:id — Delete feedback (Admin only)
// ---------------------------------------------------------------------------
const deleteFeedback = async (req, res) => {
  try {
    const { data: feedback, error } = await supabase
      .from(Feedback.TABLE_NAME)
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error || !feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackAnalytics,
  deleteFeedback,
};
