const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
  });
};

const sendVerificationEmail = async (user, token) => {
  const transporter = createEmailTransporter();
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'CEMS — Verify Your Institutional Email Address',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background:#4F46E5;padding:32px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">
                        🎓 College Event Management System
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 48px;">
                      <h2 style="color:#1e293b;margin-top:0;">Welcome, ${user.fullName}!</h2>
                      <p style="color:#475569;line-height:1.6;">
                        Your account has been created on the CEMS platform.
                        Please verify your institutional email address to activate your account
                        and gain access to campus events.
                      </p>
                      <div style="text-align:center;margin:32px 0;">
                        <a href="${verificationLink}"
                           style="background:#4F46E5;color:#ffffff;padding:14px 32px;
                                  text-decoration:none;border-radius:6px;font-size:16px;
                                  font-weight:600;display:inline-block;">
                          Verify Email Address
                        </a>
                      </div>
                      <p style="color:#94a3b8;font-size:13px;">
                        This link expires in <strong>24 hours</strong>.<br/>
                        If the button does not work, copy and paste this link into your browser:
                      </p>
                      <p style="color:#4F46E5;font-size:12px;word-break:break-all;">
                        ${verificationLink}
                      </p>
                      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
                      <p style="color:#94a3b8;font-size:12px;">
                        If you did not create a CEMS account, you can safely ignore this email.
                        No action is required.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px;text-align:center;">
                      <p style="color:#94a3b8;font-size:12px;margin:0;">
                        College Event Management System &bull; Institutional Academic Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department, semester, program, rollNumber, enrollmentNo, associatedClub, club } = req.body;

  const finalName = (fullName || '').trim();
  const finalEmail = (email || '').toLowerCase().trim();
  const finalPassword = password || '';

  if (!finalName || !finalEmail || !finalPassword) {
    res.status(400);
    throw new Error('Full name, email address, and password are required.');
  }

  if (finalPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  const allowedSelfRoles = ['student', 'organizer'];
  const assignedRole = allowedSelfRoles.includes(role) ? role : 'student';

  const queryConditions = [{ email: finalEmail }];
  const finalRollNumber = (rollNumber || enrollmentNo || '').trim().toUpperCase();
  
  if (finalRollNumber) {
    queryConditions.push({ rollNumber: finalRollNumber });
  }

  const existingUser = await User.findOne({ $or: queryConditions });

  if (existingUser) {
    if (existingUser.isVerified === true) {
      res.status(409);
      throw new Error('An account with this email or ID already exists and is verified.');
    } else {
      await User.findByIdAndDelete(existingUser._id);
    }
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const userData = {
    fullName: finalName,
    email: finalEmail,
    password: finalPassword,
    role: assignedRole,
    verificationToken,
    isVerified: false,
    department: null,
    rollNumber: null,
    semester: null,
    program: null,
    club: null,
  };

  if (assignedRole === 'student') {
    userData.department = department?.trim() || null;
    userData.rollNumber = finalRollNumber || null;
    userData.semester = semester?.trim() || null;
    userData.program = program?.trim() || null;
  }

  if (assignedRole === 'organizer') {
    userData.club = (associatedClub || club)?.trim() || null;
    userData.isApproved = false;
  }

  const user = await User.create(userData);

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (emailError) {
    console.error(emailError);
  }

  if (assignedRole === 'organizer') {
    return res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email first. After verification, your profile will be sent to the Super Admin for final approval.',
    });
  }

  res.status(201).json({
    success: true,
    message: `Account created successfully. A verification link has been sent to ${user.email}. Please check your inbox (and spam folder).`,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    res.status(400);
    throw new Error('Verification token is missing from the request.');
  }

  const user = await User.findOne({ verificationToken: token }).select('+verificationToken');

  if (!user) {
    res.status(400);
    throw new Error('This verification link is invalid or has already been used. Please request a new one.');
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'Your email is already verified. Please proceed to login.',
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! Your account is now active. You can log in.',
  });
});

const checkStatus = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    res.status(400);
    throw new Error('Email address is required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    isVerified: user.isVerified,
  });
});

const login = asyncHandler(async (req, res) => {
  const identifier = (req.body.email || req.body.identifier || '').trim();
  const password = req.body.password || '';

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Email or Enrollment No. and password are required.');
  }

  const normalizedIdentifier = identifier.toLowerCase();
  const upperIdentifier = identifier.toUpperCase();

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { rollNumber: upperIdentifier },
    ],
  }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials. Please check your email/enrollment number and password.');
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error('Your email address has not been verified. Please check your inbox for the verification link.');
  }

  if (user.role === 'organizer' && user.isApproved === false) {
    res.status(403);
    throw new Error('Your organizer account is pending Super Admin approval. You will be able to log in once verified.');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Invalid credentials. Please check your email/enrollment number and password.');
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.fullName}!`,
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      department: user.department,
      rollNumber: user.rollNumber,
      club: user.club || null,
      semester: user.semester || null,
      program: user.program || null,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User profile not found.');
  }

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      department: user.department,
      rollNumber: user.rollNumber,
      club: user.club || null,
      semester: user.semester || null,
      program: user.program || null,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
    },
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email address is required.');
  }

  const genericSuccessResponse = {
    success: true,
    message: 'If an unverified account exists with this email, a new verification link has been sent.',
  };

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select('+verificationToken');

  if (!user) return res.status(200).json(genericSuccessResponse);
  
  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'This account is already verified. Please log in.',
    });
  }

  const newToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = newToken;
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user, newToken);
  } catch (emailError) {
    res.status(500);
    throw new Error('Failed to send verification email. Please try again later.');
  }

  res.status(200).json(genericSuccessResponse);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [{ fullName: searchRegex }, { email: searchRegex }];
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('-password -verificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    users,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const validRoles = ['student', 'organizer', 'super_admin'];

  if (!role || !validRoles.includes(role)) {
    res.status(400);
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}.`);
  }

  if (userId === req.user._id.toString() && role !== 'super_admin') {
    res.status(400);
    throw new Error('You cannot change your own role. Ask another Super Admin to perform this action.');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password -verificationToken');

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    message: `${user.fullName}'s role has been updated to '${role}'.`,
    user,
  });
});

const approveOrganizer = asyncHandler(async (req, res) => {
  const { userId, action } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (user.role !== 'organizer') {
    res.status(400);
    throw new Error('This user is not an organizer.');
  }

  if (action === 'approve') {
    user.isApproved = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: `Organizer "${user.fullName}" has been approved.`,
      user,
    });
  }

  if (action === 'reject') {
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: `Organizer "${user.fullName}" has been rejected and removed.`,
    });
  }

  res.status(400);
  throw new Error('Invalid action. Must be "approve" or "reject".');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.fullName = req.body.fullName || req.body.name || user.fullName;
  user.department = req.body.department || req.body.school || user.department;
  user.rollNumber = req.body.rollNumber || req.body.enrollmentNo || user.rollNumber;

  if (req.file && req.file.path) {
    user.avatarUrl = req.file.path;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      department: updatedUser.department,
      rollNumber: updatedUser.rollNumber,
      club: updatedUser.club || null,
      semester: updatedUser.semester || null,
      program: updatedUser.program || null,
    },
  });
});

module.exports = {
  register,
  verifyEmail,
  checkStatus,
  login,
  getMe,
  resendVerification,
  getAllUsers,
  updateUserRole,
  approveOrganizer,
  updateProfile,
};