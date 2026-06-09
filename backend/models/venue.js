const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Venue name is required'], unique: true, trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: [1, 'Capacity must be at least 1'] },
    facilities: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);