// routes/menuRoutes.js
// Handles menu queries and management.

const express = require('express');
const router = express.Router();

const {
  getTodaysMenu,
  getWeeklyMenu,
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu
} = require('../controllers/menuController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public access for viewing menu
router.get('/today', getTodaysMenu);
router.get('/week', getWeeklyMenu);

// Protected routes
router.use(protect);

// Admin/Staff view all menus
router.get('/', authorize("staff", "admin"), getAllMenus);

// Admin/Staff update; Admin-only create/delete
router.post('/', authorize("admin"), createMenu);
router.put('/:id', authorize("staff", "admin"), updateMenu);
router.delete('/:id', authorize("admin"), deleteMenu);

module.exports = router;
