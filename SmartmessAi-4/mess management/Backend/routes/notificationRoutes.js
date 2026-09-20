// routes/notificationRoutes.js
// Handles broadcasted and targeted notifications.

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Notifications reading (available to all roles)
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Notifications creation/deletion (Admin only)
router.post('/', authorize("admin"), createNotification);
router.delete('/:id', authorize("admin"), deleteNotification);

module.exports = router;
