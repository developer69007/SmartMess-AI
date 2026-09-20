// routes/adminRoutes.js
// Dedicated entry points for admin actions.
// All routes below /login are protected (admin role required).

const express = require('express');
const router = express.Router();

const {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  updateStudentRole,
  getAllStudentsAdmin,
  getAdminOverview,
} = require('../controllers/adminController');

const {
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');

const { getDashboardStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ---------------------------------------------------------------------------
// Public route — no token needed to log in
// ---------------------------------------------------------------------------
router.post('/login', adminLogin);

// ---------------------------------------------------------------------------
// All routes below require a valid JWT AND the admin role
// ---------------------------------------------------------------------------
router.use(protect);
router.use(authorize('admin'));

// Admin profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Dashboard stats & overview
router.get('/dashboard-stats', getDashboardStats);
router.get('/overview', getAdminOverview);

// Student management
router.get('/students', getAllStudentsAdmin);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/role', updateStudentRole);

// Staff management
router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

module.exports = router;