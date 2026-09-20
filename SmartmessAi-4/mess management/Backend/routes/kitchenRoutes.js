// routes/kitchenRoutes.js
// Kitchen daily status reporting.

const express = require('express');
const router = express.Router();

const { getKitchenStatus, updateKitchenStatus } = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Allow students, staff, and admins to check status, but only staff/admin to update
router.get('/status', getKitchenStatus);
router.put('/status', authorize("staff", "admin"), updateKitchenStatus);

module.exports = router;
