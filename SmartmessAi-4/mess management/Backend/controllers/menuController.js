// controllers/menuController.js
// Menu operations using Supabase.

const supabase = require("../config/supabaseClient");
const MessMenu = require("../models/MessMenu");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

const formatMenu = (menu) => {
  if (!menu) return null;
  return {
    ...menu,
    _id: menu.id,
    specialNote: menu.special_note || menu.specialNote || '',
    createdBy: menu.created_by || menu.createdBy,
    updatedBy: menu.updated_by || menu.updatedBy,
    createdAt: menu.created_at || menu.createdAt,
    updatedAt: menu.updated_at || menu.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// GET /api/menu/today — Fetch today's menu
// ---------------------------------------------------------------------------
const getTodaysMenu = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const { data: menu, error } = await supabase
      .from(MessMenu.TABLE_NAME)
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!menu) {
      return res.status(200).json({
        success: true,
        menu: null,
        message: "No menu set for today yet",
      });
    }

    res.status(200).json({ success: true, menu: formatMenu(menu) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/menu/week — Fetch the next 7 days of menus
// ---------------------------------------------------------------------------
const getWeeklyMenu = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const { data: menus, error } = await supabase
      .from(MessMenu.TABLE_NAME)
      .select("*")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const formatted = (menus || []).map(formatMenu);
    res.status(200).json({ success: true, count: formatted.length, menus: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/menu — Get all menus (paginated)
// ---------------------------------------------------------------------------
const getAllMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: menus, error, count } = await supabase
      .from(MessMenu.TABLE_NAME)
      .select("*", { count: "exact" })
      .order("date", { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const total = count || 0;
    const formatted = (menus || []).map(formatMenu);

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      menus: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/menu — Create a new menu entry (Admin only)
// ---------------------------------------------------------------------------
const createMenu = async (req, res) => {
  try {
    const { date, day, meals, specialNote } = req.body;

    if (!date || !day) {
      return res.status(400).json({
        success: false,
        message: "Date and day are required",
      });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateObj);
    dateEnd.setHours(23, 59, 59, 999);

    const { data: existing } = await supabase
      .from(MessMenu.TABLE_NAME)
      .select("id")
      .gte("date", dateObj.toISOString())
      .lte("date", dateEnd.toISOString())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A menu already exists for this date. Use PUT to update it.",
      });
    }

    const { data: menu, error } = await supabase
      .from(MessMenu.TABLE_NAME)
      .insert({
        date: dateObj.toISOString(),
        day,
        meals: meals || {},
        special_note: specialNote || "",
        created_by: req.user ? (req.user.id || req.user._id) : null,
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, menu: formatMenu(menu) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/menu/:id — Update an existing menu entry (Admin/Staff)
// ---------------------------------------------------------------------------
const updateMenu = async (req, res) => {
  try {
    const { meals, specialNote, day } = req.body;

    const updateData = {};
    if (meals) updateData.meals = meals;
    if (specialNote !== undefined) updateData.special_note = specialNote;
    if (day) updateData.day = day;
    if (req.user) updateData.updated_by = req.user.id || req.user._id;

    const { data: menu, error } = await supabase
      .from(MessMenu.TABLE_NAME)
      .update(updateData)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error || !menu) {
      return res.status(404).json({ success: false, message: "Menu not found" });
    }

    res.status(200).json({ success: true, menu: formatMenu(menu) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/menu/:id — Delete a menu (Admin only)
// ---------------------------------------------------------------------------
const deleteMenu = async (req, res) => {
  try {
    const { data: menu, error } = await supabase
      .from(MessMenu.TABLE_NAME)
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error || !menu) {
      return res.status(404).json({ success: false, message: "Menu not found" });
    }

    res.status(200).json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getTodaysMenu,
  getWeeklyMenu,
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
};
