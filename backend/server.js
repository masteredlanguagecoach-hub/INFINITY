require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel / serverless reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Allow CORS from any origin (reflecting origin with credentials)
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'AR6aDumWSOzszBigm1rbvVDGdiA2uAXspUvrVKWOsKvyDK0gp7YVeX9lmrs1QsNJ',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Serve frontend build if running as a combined monolithic server
const fs = require('fs');
const staticDir = fs.existsSync(path.join(__dirname, '../frontend/dist')) 
  ? path.join(__dirname, '../frontend/dist') 
  : path.join(__dirname, 'public');

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Internal server error' } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
