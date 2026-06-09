const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authmiddleware');

router.get('/', protect, getMyNotifications);
router.patch('/mark-read', protect, markAsRead);

module.exports = router;