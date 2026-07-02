const express = require('express');
const router = express.Router();

const {
  findCAs,
  updateCAProfile,
  getCADashboard,
  getPendingReviews
} = require('../controllers/ca.controller.js');

const { protect } = require('../middleware/auth.js');

// ====================
// Search CAs
// ====================
router.get(
  '/search',
  protect,
  findCAs
);

// ====================
// CA Profile
// ====================
router.put(
  '/profile',
  protect,
  updateCAProfile
);

// ====================
// Dashboard
// ====================
router.get(
  '/dashboard',
  protect,
  getCADashboard
);

// ====================
// Pending Reviews
// ====================
router.get(
  '/reviews',
  protect,
  getPendingReviews
);

module.exports = router;