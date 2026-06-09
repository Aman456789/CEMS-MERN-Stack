const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getPendingOrganizers = asyncHandler(async (req, res) => {
  const pendingOrganizers = await User.find({
    role: 'organizer',
    $or: [{ isApproved: false }, { isVerified: false }],
  }).select('-password -verificationToken');

  res.status(200).json({
    success: true,
    count: pendingOrganizers.length,
    organizers: pendingOrganizers,
  });
});

const approveOrganizer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (user.role !== 'organizer') {
    res.status(400);
    throw new Error('User is not an organizer.');
  }

  user.isVerified = true;
  user.isApproved = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Organizer ${user.fullName} has been approved successfully.`,
    user,
  });
});

const rejectOrganizer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (user.role !== 'organizer') {
    res.status(400);
    throw new Error('User is not an organizer.');
  }

  const name = user.fullName;
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `Organizer ${name} has been rejected and removed.`,
  });
});

module.exports = {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
};
