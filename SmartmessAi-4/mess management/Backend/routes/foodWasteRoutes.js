// routes/foodWasteRoutes.js
// Food waste recording and analytics.

const express = require('express');
const router = express.Router();

const {
  recordFoodWaste,
  getTodayWaste,
  getWasteHistory,
} = require('../controllers/foodWasteController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Staff/Admin access
router.get('/today', authorize('staff', 'admin'), getTodayWaste);
router.post('/', authorize('staff', 'admin'), recordFoodWaste);

// Admin only — historical data
router.get('/history', authorize('admin'), getWasteHistory);

module.exports = router;
