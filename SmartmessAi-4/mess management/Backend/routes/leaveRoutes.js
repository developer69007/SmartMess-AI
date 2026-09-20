// routes/leaveRoutes.js
// Mess leave application and approval routes.

const express = require('express');
const router = express.Router();

const {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus
} = require('../controllers/leaveController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student leave application
router.post('/', authorize("student"), applyLeave);
router.get('/my', authorize("student"), getMyLeaveRequests);

// Admin operations
router.get('/', authorize("admin"), getAllLeaveRequests);
router.put('/:id', authorize("admin"), updateLeaveStatus);

module.exports = router;
