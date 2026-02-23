import express from 'express';
import { postCheckIn, postCheckOut, getToday, getHistoryToday } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/attendance/today', getToday);
router.get('/history/today', getHistoryToday);
router.post('/checkin', postCheckIn);
router.post('/checkout', postCheckOut);

export default router;
