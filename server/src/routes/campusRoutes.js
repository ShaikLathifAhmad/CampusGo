const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');

// GET /api/campus/locations  — list all 20 campus locations
router.get('/locations', campusController.getLocations);

// GET /api/campus/search?q=hostel  — search locations by partial name
router.get('/search', campusController.searchLocation);

// POST /api/campus/route  — get route between two locations
// Body: { start: "Main Gate", end: "SRM IST" }
router.post('/route', campusController.getRoute);

module.exports = router;
