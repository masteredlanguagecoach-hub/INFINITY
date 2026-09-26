require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-fallback',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 6 * 60 * 60 * 1000 // 6 hours
  }
}));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const decisionCenterRoutes = require('./routes/decisionCenter');
const jobsRoutes = require('./routes/jobs');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');

app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/decision-center', decisionCenterRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Serve frontend build (available at backend/public)
const publicDir = path.join(__dirname, 'public');
const fs = require('fs');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}


// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;

