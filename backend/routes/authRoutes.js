const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  register,
  verifyEmail,
  checkStatus,
  login,
  getMe,
  updateProfile,
  resendVerification,
  getAllUsers,
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authmiddleware");
const { uploadAvatar } = require("../utils/cloudinary");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify/:token", verifyEmail);
router.get("/check-status/:email", checkStatus);
router.post("/resend-verification", resendVerification);

router.get("/me", protect, getMe);
router.patch("/profile", protect, uploadAvatar, updateProfile);

router.get("/users", protect, authorize("super_admin"), getAllUsers);

module.exports = router;