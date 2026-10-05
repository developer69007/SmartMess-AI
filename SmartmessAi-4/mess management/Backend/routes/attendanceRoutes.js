// routes/attendanceRoutes.js
// Student and staff attendance management routes.

const express = require('express');
const router = express.Router();

const {
  markAttendance,
  getMyAttendance,
  getDailyAttendance,
  getAttendanceAnalytics,
  verifyQRAttendance
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student endpoints
router.post('/scan', authorize("student"), markAttendance);
router.get('/my', authorize("student"), getMyAttendance);

// Staff/Admin endpoints
router.get('/daily', authorize("staff", "admin"), getDailyAttendance);
router.get('/verify/:qrToken', authorize("staff", "admin"), verifyQRAttendance);
router.post('/verify', authorize("staff", "admin"), verifyQRAttendance);

// Admin-only endpoints
router.get('/analytics', authorize("admin"), getAttendanceAnalytics);

module.exports = router;
