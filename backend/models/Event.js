const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required.'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters.'],
      maxlength: [120, 'Title cannot exceed 120 characters.'],
    },

    description: {
      type: String,
      required: [true, 'Event description is required.'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters.'],
      maxlength: [3000, 'Description cannot exceed 3000 characters.'],
    },

    venue: {
      type: String,
      required: [true, 'Venue is required.'],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, 'Event date is required.'],
    },

    startTime: {
      type: Date,
      required: [true, 'Start time is required.'],
    },

    endTime: {
      type: Date,
      required: [true, 'End time is required.'],
    },

    imageUrl: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator reference is required.'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected.',
      },
      default: 'pending',
    },

    capacity: {
      type: Number,
      default: null,
      min: [1, 'Capacity must be at least 1 if specified.'],
    },

    category: {
      type: String,
      enum: {
        values: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'social', 'other'],
        message: 'Invalid category.',
      },
      default: 'other',
    },

    club: {
      type: String,
      default: null,
      trim: true,
    },

    registrationDeadline: {
      type: Date,
      default: null,
    },

    department: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EventSchema.index({ venue: 1, date: 1, startTime: 1, endTime: 1 });
EventSchema.index({ status: 1, createdAt: -1 });
EventSchema.index({ status: 1, date: 1 });

EventSchema.pre('save', function (next) {
  if (this.isModified('venue') && this.venue) {
    this.venue = this.venue.trim().toUpperCase();
  }
  next();
});

EventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  if (this.registrationDeadline) {
    return now < this.registrationDeadline;
  }
  return now < this.startTime;
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;