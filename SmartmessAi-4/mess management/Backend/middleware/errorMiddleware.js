// middleware/errorMiddleware.js
// Centralized Express error-handling middleware supporting PostgreSQL/Supabase errors.

const ErrorResponse = require("../utils/errorHandler");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // PostgreSQL / Supabase Duplicate Key Error (23505)
  if (err.code === "23505" || err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // PostgreSQL Invalid UUID / Bad Syntax (22P02)
  if (err.code === "22P02" || err.name === "CastError") {
    const message = "Invalid resource identifier format";
    error = new ErrorResponse(message, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Not authorized, token failed";
    error = new ErrorResponse(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Not authorized, token expired";
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
