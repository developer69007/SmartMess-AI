// middleware/authMiddleware.js
// Standard JWT verification supporting Student, Admin, and Staff tables in Supabase.

const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const Staff = require("../models/Staff");

// -----------------------------------------------------------------------------
// 1. protect
// -----------------------------------------------------------------------------
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let table = Student.TABLE_NAME;
    if (decoded.model === "Admin") {
      table = Admin.TABLE_NAME;
    } else if (decoded.model === "Staff") {
      table = Staff.TABLE_NAME;
    }

    const { data: user, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    // Attach both id and _id for backward compatibility with frontend/controllers
    user._id = user.id;
    delete user.password;

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
    });
  }
};

// -----------------------------------------------------------------------------
// 2. authorize(...roles)
// -----------------------------------------------------------------------------
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please log in first",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not allowed to access this resource`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };