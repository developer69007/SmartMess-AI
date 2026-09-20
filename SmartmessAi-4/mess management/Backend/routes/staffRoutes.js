// routes/staffRoutes.js
// Dedicated entry points for staff actions.

const express = require('express');
const router = express.Router();

const {
  staffLogin,
  getStaffProfile,
  updateStaffProfile
} = require('../controllers/staffController');

const { getStaffDashboardStats } = require('../controllers/analyticsController');
const { getKitchenStatus, updateKitchenStatus } = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/staff/login
router.post('/login', staffLogin);

// Protect all other routes for staff only
router.use(protect);
router.use(authorize("staff"));

// Staff profile
router.get('/profile', getStaffProfile);
router.put('/profile', updateStaffProfile);

// Dashboard & Kitchen operations
router.get('/dashboard-stats', getStaffDashboardStats);
router.get('/kitchen-status', getKitchenStatus);
router.put('/kitchen-status', updateKitchenStatus);

module.exports = router;