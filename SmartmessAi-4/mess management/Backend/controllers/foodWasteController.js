// controllers/foodWasteController.js
// Food waste tracking per meal using Supabase.

const supabase = require("../config/supabaseClient");
const FoodWaste = require("../models/FoodWaste");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

const formatWaste = (rec) => {
  if (!rec) return null;
  return {
    ...rec,
    _id: rec.id,
    mealType: rec.meal_type || rec.mealType,
    totalPreparedKg: Number(rec.total_prepared_kg !== undefined ? rec.total_prepared_kg : rec.totalPreparedKg),
    wasteKg: Number(rec.waste_kg !== undefined ? rec.waste_kg : rec.wasteKg),
    wastePercentage: Number(rec.waste_percentage !== undefined ? rec.waste_percentage : rec.wastePercentage),
    costSavedINR: Number(rec.cost_saved_inr !== undefined ? rec.cost_saved_inr : rec.costSavedINR),
    recordedBy: rec.staff ? { ...rec.staff, _id: rec.recorded_by } : rec.recorded_by,
    createdAt: rec.created_at || rec.createdAt,
    updatedAt: rec.updated_at || rec.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// POST /api/food-waste — Record food waste for a meal (Staff/Admin only)
// ---------------------------------------------------------------------------
const recordFoodWaste = async (req, res) => {
  try {
    const { date, mealType, totalPreparedKg, wasteKg, costSavedINR, notes } = req.body;

    if (!mealType || totalPreparedKg === undefined || wasteKg === undefined) {
      return res.status(400).json({
        success: false,
        message: "Meal type, total prepared (kg), and waste (kg) are required",
      });
    }

    const prep = Number(totalPreparedKg);
    const waste = Number(wasteKg);

    if (waste > prep) {
      return res.status(400).json({
        success: false,
        message: "Waste cannot be greater than total prepared",
      });
    }

    const recordDate = date ? new Date(date) : new Date();
    recordDate.setHours(0, 0, 0, 0);
    const recordEnd = new Date(recordDate.getTime() + 86399999);

    const wastePercentage = FoodWaste.computeWastePercentage(prep, waste);

    const { data: existing } = await supabase
      .from(FoodWaste.TABLE_NAME)
      .select("id")
      .gte("date", recordDate.toISOString())
      .lte("date", recordEnd.toISOString())
      .eq("meal_type", mealType)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from(FoodWaste.TABLE_NAME)
        .update({
          total_prepared_kg: prep,
          waste_kg: waste,
          waste_percentage: wastePercentage,
          cost_saved_inr: costSavedINR ? Number(costSavedINR) : 0,
          notes: notes || "",
          recorded_by: req.user ? (req.user.id || req.user._id) : null,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) return res.status(500).json({ success: false, message: error.message });
      result = data;
    } else {
      const { data, error } = await supabase
        .from(FoodWaste.TABLE_NAME)
        .insert({
          date: recordDate.toISOString(),
          meal_type: mealType,
          total_prepared_kg: prep,
          waste_kg: waste,
          waste_percentage: wastePercentage,
          cost_saved_inr: costSavedINR ? Number(costSavedINR) : 0,
          notes: notes || "",
          recorded_by: req.user ? (req.user.id || req.user._id) : null,
        })
        .select("*")
        .single();

      if (error) return res.status(500).json({ success: false, message: error.message });
      result = data;
    }

    res.status(201).json({
      success: true,
      message: "Food waste recorded successfully",
      waste: formatWaste(result),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/food-waste/today — Today's waste records (Staff/Admin)
// ---------------------------------------------------------------------------
const getTodayWaste = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const { data: records, error } = await supabase
      .from(FoodWaste.TABLE_NAME)
      .select("*, staff(name)")
      .gte("date", start)
      .lte("date", end);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (records || []).map(formatWaste);

    const totalWasteKg = formatted.reduce((sum, r) => sum + r.wasteKg, 0);
    const totalPreparedKg = formatted.reduce((sum, r) => sum + r.totalPreparedKg, 0);
    const avgWastePercent =
      totalPreparedKg > 0 ? ((totalWasteKg / totalPreparedKg) * 100).toFixed(1) : 0;
    const totalCostSaved = formatted.reduce((sum, r) => sum + (r.costSavedINR || 0), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalWasteKg,
        totalPreparedKg,
        avgWastePercent: Number(avgWastePercent),
        totalCostSaved,
        mealsRecorded: formatted.length,
      },
      records: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/food-waste/history — Historical waste records (Admin)
// ---------------------------------------------------------------------------
const getWasteHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let query = supabase
      .from(FoodWaste.TABLE_NAME)
      .select("*, staff(name)")
      .gte("date", startDate.toISOString())
      .order("date", { ascending: false });

    if (req.query.mealType) {
      query = query.eq("meal_type", req.query.mealType);
    }

    const { data: records, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (records || []).map(formatWaste);

    res.status(200).json({
      success: true,
      count: formatted.length,
      days,
      records: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  recordFoodWaste,
  getTodayWaste,
  getWasteHistory,
};
