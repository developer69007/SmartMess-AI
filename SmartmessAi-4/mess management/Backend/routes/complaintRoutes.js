// routes/complaintRoutes.js
// Complaint registration and status tracking.

const express = require('express');
const router = express.Router();

const {
  raiseComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student complaints
router.post('/', authorize("student"), raiseComplaint);
router.get('/my', authorize("student"), getMyComplaints);

// Admin operations
router.get('/', authorize("admin"), getAllComplaints);
router.put('/:id', authorize("admin"), updateComplaint);
router.delete('/:id', authorize("admin"), deleteComplaint);

module.exports = router;
