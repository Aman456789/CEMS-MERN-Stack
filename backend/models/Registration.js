const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required for registration.'],
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required for registration.'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: "Status must be 'pending', 'approved', or 'rejected'.",
      },
      default: 'pending',
    },

    processedAt: {
      type: Date,
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    organizerNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, 'Organizer note cannot exceed 500 characters.'],
    },

    attendanceMarked: {
      type: Boolean,
      default: false,
    },

    attendedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ student: 1, event: 1 }, { unique: true });
RegistrationSchema.index({ event: 1, status: 1 });
RegistrationSchema.index({ student: 1, createdAt: -1 });
RegistrationSchema.index({ status: 1, createdAt: -1 });

RegistrationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.processedAt = new Date();
  }
  next();
});

RegistrationSchema.statics.getEventRegistrationCount = async function (eventId) {
  return await this.countDocuments({ event: eventId, status: 'approved' });
};

const Registration = mongoose.model('Registration', RegistrationSchema);
module.exports = Registration;