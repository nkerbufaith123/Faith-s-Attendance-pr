import express from 'express';
import cors from 'cors';
import attendanceRoutes from './server/routes/attendance.js';
import qrRoutes from './server/routes/qr.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Mount API routes under /api
app.use('/api', attendanceRoutes);
app.use('/api', qrRoutes);

// Basic health
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Serve HTML pages for SPA routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'dashboard.html'));
});

app.get('/attendance', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'attendance.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'reports.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'settings.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'admin-dashboard.html'));
});

app.get('/task', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'task.html'));
});

app.listen(PORT, () => {
  console.log(`Attendance API (Express) listening on http://localhost:${PORT}`);
});
