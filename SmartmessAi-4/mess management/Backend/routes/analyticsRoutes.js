// routes/analyticsRoutes.js
// Analytics for trends and dashboards.

const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAttendanceTrend,
  getMealDistribution,
  getFeedbackSummary,
  getStaffDashboardStats
} = require('../controllers/analyticsController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin dashboard analytics
router.get('/dashboard', authorize("admin"), getDashboardStats);
router.get('/attendance-trend', authorize("admin"), getAttendanceTrend);
router.get('/feedback-summary', authorize("admin"), getFeedbackSummary);

// Shared/Staff analytics
router.get('/meal-distribution', authorize("staff", "admin"), getMealDistribution);
router.get('/staff-stats', authorize("staff", "admin"), getStaffDashboardStats);

module.exports = router;
