const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters.'],
      maxlength: [100, 'Full name cannot exceed 100 characters.'],
    },

    email: {
      type: String,
      required: [true, 'Institutional email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['student', 'organizer', 'super_admin'],
        message: 'Invalid role. Must be student, organizer, or super_admin.',
      },
      default: 'student',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    verificationToken: {
      type: String,
      select: false,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    rollNumber: {
      type: String,
      default: null,
      trim: true,
    },

    department: {
      type: String,
      default: null,
      trim: true,
    },

    club: {
      type: String,
      default: null,
      trim: true,
    },

    semester: {
      type: String,
      default: null,
      trim: true,
    },

    program: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ rollNumber: 1 }, { sparse: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;