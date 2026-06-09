const express = require('express');
const router = express.Router();
const {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.use(protect);
router.use(authorize('super_admin'));

router.get('/pending-organizers', getPendingOrganizers);
router.put('/approve-organizer/:id', approveOrganizer);
router.delete('/reject-organizer/:id', rejectOrganizer);

module.exports = router;
