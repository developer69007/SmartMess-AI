// controllers/kitchenController.js
// Kitchen operational status using Supabase.

const supabase = require("../config/supabaseClient");
const KitchenStatus = require("../models/KitchenStatus");

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatStatus = (s) => {
  if (!s) return null;
  return {
    ...s,
    _id: s.id,
    gasStatus: s.gas_status || s.gasStatus,
    waterStatus: s.water_status || s.waterStatus,
    cookingStatus: s.cooking_status || s.cookingStatus,
    preparingMeal: s.preparing_meal || s.preparingMeal,
    cleaningStatus: s.cleaning_status || s.cleaningStatus,
    updatedBy: s.staff ? { ...s.staff, _id: s.updated_by } : s.updated_by,
    createdAt: s.created_at || s.createdAt,
    updatedAt: s.updated_at || s.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// GET /api/kitchen/status — Get today's kitchen status
// ---------------------------------------------------------------------------
const getKitchenStatus = async (req, res) => {
  try {
    const today = getToday();
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const { data: status, error } = await supabase
      .from(KitchenStatus.TABLE_NAME)
      .select("*, staff(name)")
      .gte("date", today.toISOString())
      .lte("date", todayEnd.toISOString())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!status) {
      return res.status(200).json({
        success: true,
        status: {
          date: today,
          temperature: "24°C",
          gasStatus: "Normal",
          waterStatus: "Available",
          cookingStatus: "Pending",
          preparingMeal: "",
          cleaningStatus: "Pending",
          notes: "",
          updatedBy: null,
        },
        isDefault: true,
        message: "No kitchen status set for today. Showing defaults.",
      });
    }

    res.status(200).json({ success: true, status: formatStatus(status), isDefault: false });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/kitchen/status — Update today's kitchen status (Staff/Admin)
// ---------------------------------------------------------------------------
const updateKitchenStatus = async (req, res) => {
  try {
    const {
      temperature,
      gasStatus,
      waterStatus,
      cookingStatus,
      preparingMeal,
      cleaningStatus,
      notes,
    } = req.body;

    const today = getToday();
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const updateData = {
      updated_by: req.user ? (req.user.id || req.user._id) : null,
    };

    if (temperature !== undefined) updateData.temperature = temperature;
    if (gasStatus !== undefined) updateData.gas_status = gasStatus;
    if (waterStatus !== undefined) updateData.water_status = waterStatus;
    if (cookingStatus !== undefined) updateData.cooking_status = cookingStatus;
    if (preparingMeal !== undefined) updateData.preparing_meal = preparingMeal;
    if (cleaningStatus !== undefined) updateData.cleaning_status = cleaningStatus;
    if (notes !== undefined) updateData.notes = notes;

    const { data: existing } = await supabase
      .from(KitchenStatus.TABLE_NAME)
      .select("id")
      .gte("date", today.toISOString())
      .lte("date", todayEnd.toISOString())
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from(KitchenStatus.TABLE_NAME)
        .update(updateData)
        .eq("id", existing.id)
        .select("*, staff(name)")
        .single();

      if (error) return res.status(500).json({ success: false, message: error.message });
      result = data;
    } else {
      const { data, error } = await supabase
        .from(KitchenStatus.TABLE_NAME)
        .insert({
          ...updateData,
          date: today.toISOString(),
        })
        .select("*, staff(name)")
        .single();

      if (error) return res.status(500).json({ success: false, message: error.message });
      result = data;
    }

    res.status(200).json({
      success: true,
      message: "Kitchen status updated",
      status: formatStatus(result),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getKitchenStatus,
  updateKitchenStatus,
};
