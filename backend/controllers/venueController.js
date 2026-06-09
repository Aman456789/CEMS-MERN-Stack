const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');

const createVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.create(req.body);
  res.status(201).json({ success: true, venue });
});

const getAllVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, count: venues.length, venues });
});

const getVenueById = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
  res.status(200).json({ success: true, venue });
});

const updateVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
  res.status(200).json({ success: true, venue });
});

const deactivateVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
  res.status(200).json({ success: true, message: 'Venue deactivated' });
});

module.exports = { createVenue, getAllVenues, getVenueById, updateVenue, deactivateVenue };