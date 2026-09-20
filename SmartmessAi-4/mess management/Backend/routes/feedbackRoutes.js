// routes/feedbackRoutes.js
// Student feedback and analytics routes.

const express = require('express');
const router = express.Router();

const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackAnalytics,
  deleteFeedback
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student feedback submission and history
router.post('/', authorize("student"), submitFeedback);
router.get('/my', authorize("student"), getMyFeedback);

// Staff/Admin access
router.get('/', authorize("staff", "admin"), getAllFeedback);
router.get('/analytics', authorize("admin"), getFeedbackAnalytics);
router.delete('/:id', authorize("admin"), deleteFeedback);

module.exports = router;
