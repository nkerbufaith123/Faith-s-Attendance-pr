import { readAttendance, writeAttendance } from '../services/storageService.js';

function formatTimeISO(date) {
  return date.toISOString();
}

function formatTimeHHMMSS(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function getToday(req, res) {
  const email = req.query.email || req.body.email || 'anon';
  const data = readAttendance();
  const today = new Date().toISOString().split('T')[0];
  const userData = (data[email] && data[email][today]) || null;
  if (!userData) return res.json({ success: true, data: null, message: 'No Attendance Recorded Today' });
  return res.json({ success: true, data: userData });
}

export function getHistoryToday(req, res) {
  const email = req.query.email || req.body.email || 'anon';
  const data = readAttendance();
  const today = new Date().toISOString().split('T')[0];
  const userData = (data[email] && data[email][today]) || null;
  const events = (userData && userData.events) || [];
  return res.json({ success: true, events });
}

export function postCheckIn(req, res) {
  const email = req.body.email || 'anon';
  const now = new Date();
  const time = formatTimeHHMMSS(now);
  const timestamp = formatTimeISO(now);
  const date = now.toISOString().split('T')[0];

  const data = readAttendance();
  if (!data[email]) data[email] = {};
  if (!data[email][date]) data[email][date] = {};
  const todayRecord = data[email][date];

  // Validation: prevent duplicate check-in
  if (todayRecord.checkIn && !todayRecord.checkOut) {
    return res.status(400).json({ success: false, message: `Already Checked In at ${todayRecord.checkIn}` });
  }
  if (todayRecord.checkIn && todayRecord.checkOut) {
    return res.status(400).json({ success: false, message: 'Already Completed for today' });
  }

  todayRecord.checkIn = time;
  todayRecord.checkInTimestamp = timestamp;
  todayRecord.method = 'Manual';
  todayRecord.status = 'Checked In';
  todayRecord.events = todayRecord.events || [];
  todayRecord.events.push({ type: 'checkin', time: timestamp });

  writeAttendance(data);

  return res.json({ success: true, message: 'Successfully Checked In', data: todayRecord });
}

export function postCheckOut(req, res) {
  const email = req.body.email || 'anon';
  const now = new Date();
  const time = formatTimeHHMMSS(now);
  const timestamp = formatTimeISO(now);
  const date = now.toISOString().split('T')[0];

  const data = readAttendance();
  if (!data[email]) data[email] = {};
  if (!data[email][date]) data[email][date] = {};
  const todayRecord = data[email][date];

  // Validation: must have checked in
  if (!todayRecord.checkIn) {
    return res.status(400).json({ success: false, message: 'Please Check In First' });
  }
  if (todayRecord.checkOut) {
    return res.status(400).json({ success: false, message: `Already Checked Out at ${todayRecord.checkOut}` });
  }

  todayRecord.checkOut = time;
  todayRecord.checkOutTimestamp = timestamp;
  todayRecord.status = 'Checked Out';
  todayRecord.events = todayRecord.events || [];
  todayRecord.events.push({ type: 'checkout', time: timestamp });

  // Optionally calculate duration
  if (todayRecord.checkIn) {
    try {
      const [h1, m1, s1] = todayRecord.checkIn.split(':').map(Number);
      const [h2, m2, s2] = time.split(':').map(Number);
      let seconds = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
      if (seconds < 0) seconds += 86400;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      todayRecord.duration = `${hours}h ${minutes}m`;
    } catch (e) {
      todayRecord.duration = 'N/A';
    }
  }

  writeAttendance(data);
  return res.json({ success: true, message: 'Successfully Checked Out', data: todayRecord });
}
