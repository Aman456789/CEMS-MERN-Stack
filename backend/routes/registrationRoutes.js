const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  registerForEvent,
  getEventRegistrations,
  updateRegistrationStatus,
  exportAttendeesCSV,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.post('/', protect, authorize('student'), registerForEvent);
router.get('/', protect, authorize('organizer', 'super_admin'), getEventRegistrations);
router.patch('/:regId/status', protect, authorize('organizer', 'super_admin'), updateRegistrationStatus);
router.get('/export', protect, authorize('organizer', 'super_admin'), exportAttendeesCSV);

module.exports = router;