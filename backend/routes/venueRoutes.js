const express = require('express');
const router = express.Router();
const { createVenue, getAllVenues, getVenueById, updateVenue, deactivateVenue } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.get('/', protect, getAllVenues);
router.post('/', protect, authorize('super_admin'), createVenue);
router.get('/:id', protect, getVenueById);
router.put('/:id', protect, authorize('super_admin'), updateVenue);
router.delete('/:id', protect, authorize('super_admin'), deactivateVenue);

module.exports = router;