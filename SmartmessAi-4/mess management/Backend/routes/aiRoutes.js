// routes/aiRoutes.js
// AI recommendations, predictions, and chatbot placeholders.

const express = require('express');
const router = express.Router();

const {
  getAIRecommendations,
  predictAttendance,
  aiChat
} = require('../controllers/aiController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/recommend', getAIRecommendations);
router.post('/predict', predictAttendance);
router.post('/chat', aiChat);

module.exports = router;
