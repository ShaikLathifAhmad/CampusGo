const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const antiScraping = require('../middleware/antiScraping');

router.get('/', antiScraping, locationController.getLocations);
router.post('/', locationController.addLocation);
router.put('/:id', authMiddleware, locationController.updateLocation);
router.delete('/:id', authMiddleware, locationController.deleteLocation);

module.exports = router;
