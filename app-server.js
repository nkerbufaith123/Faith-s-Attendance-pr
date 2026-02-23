import express from 'express';
import cors from 'cors';
import attendanceRoutes from './server/routes/attendance.js';
import qrRoutes from './server/routes/qr.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes under /api
app.use('/api', attendanceRoutes);
app.use('/api', qrRoutes);

// Basic health
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Attendance API (Express) listening on http://localhost:${PORT}`);
});
