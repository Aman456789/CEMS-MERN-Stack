const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('event', 'title status')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, count: notifications.length, notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getMyNotifications, markAsRead };