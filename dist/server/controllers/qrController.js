import { readQrSessions, writeQrSessions } from '../services/storageService.js';
import crypto from 'crypto';

function genId() {
  return 'S' + Date.now() + crypto.randomBytes(4).toString('hex');
}

function genToken(len = 12) {
  return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
}

export function generateQr(req, res) {
  const email = req.body.email || 'anon';
  const expiresIn = Number(req.body.expiresIn) || 60; // seconds

  const sessions = readQrSessions();
  const id = genId();
  const token = genToken(12);
  const now = Date.now();
  const expiry = now + (expiresIn * 1000);

  sessions[id] = {
    sessionId: id,
    token,
    createdAt: new Date(now).toISOString(),
    expiryAt: new Date(expiry).toISOString(),
    expiryTimestamp: expiry,
    used: false,
    createdBy: email
  };

  writeQrSessions(sessions);

  // Return QR payload (frontend may convert to QR image)
  const qrData = `session=${id}&token=${token}`;
  return res.json({ success: true, sessionId: id, token, qrData, expiryAt: sessions[id].expiryAt });
}

export function verifyQr(req, res) {
  const { session, token, email } = req.body;
  if (!session || !token) return res.status(400).json({ success: false, message: 'Missing session or token' });

  const sessions = readQrSessions();
  const s = sessions[session];
  if (!s) return res.status(400).json({ success: false, message: 'Invalid QR Code' });
  if (s.used) return res.status(400).json({ success: false, message: 'QR Code Already Used' });
  if (Date.now() > (s.expiryTimestamp || 0)) return res.status(400).json({ success: false, message: 'QR Code Expired' });
  if (s.token !== token) return res.status(400).json({ success: false, message: 'Invalid QR Code' });

  // Valid: mark used
  s.used = true;
  s.usedBy = email || 'anon';
  s.usedAt = new Date().toISOString();
  writeQrSessions(sessions);

  // Return success and let frontend call checkin via API or we can auto-record
  return res.json({ success: true, message: 'QR Verified', session: s });
}
