// routes/quantumRoutes.js
// Quantum computing placeholder routes.

const express = require('express');
const router = express.Router();

const { runQuantumOptimization } = require('../controllers/quantumController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', runQuantumOptimization);

module.exports = router;
