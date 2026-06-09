

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

process.env.TZ = "Asia/Kolkata";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB");

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (existing) {
      console.log(`ℹ️   Super Admin already exists: ${process.env.ADMIN_EMAIL}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    await User.create({
      fullName: "CEMS Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, 
      role: "super_admin",
      isVerified: true, 
      isActive: true,
    });

    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║           Super Admin Created Successfully       ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log(`📧  Email    : ${process.env.ADMIN_EMAIL}`);
    console.log(`🔑  Password : ${process.env.ADMIN_PASSWORD}`);
    console.log("\n⚠️   IMPORTANT: Change these credentials after first login!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌  Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();