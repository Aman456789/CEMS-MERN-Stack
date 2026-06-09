process.env.TZ = 'Asia/Kolkata';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ role: 'super_admin' });
    if (!existing) {
      await User.create({
        fullName: 'Super Admin',
        email: 'admin@cems.edu',
        password: 'SuperAdmin@Password123!',
        role: 'super_admin',
        isVerified: true,
        isApproved: true,
      });
      console.log('🔑 Default Super Admin account seeded (admin@cems.edu)');
    }
  } catch (seedErr) {
    console.error('⚠️  Super Admin seed skipped:', seedErr.message);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const venueRoutes = require('./routes/venueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CEMS API is running.',
    timezone: process.env.TZ,
    environment: process.env.NODE_ENV,
    serverTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('─── Unhandled Error ──────────────────────────');
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  console.error(err.stack);
  console.error('─────────────────────────────────────────────');

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(' '),
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  🎓  CEMS API Server');
  console.log('═══════════════════════════════════════════════');
  console.log(`  ✅ Status    : Running`);
  console.log(`  🌐 URL       : http://localhost:${PORT}`);
  console.log(`  🌍 Env       : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🕐 Timezone  : ${process.env.TZ}`);
  console.log(`  🕐 IST Time  : ${new Date().toLocaleString('en-IN')}`);
  console.log('═══════════════════════════════════════════════');
});