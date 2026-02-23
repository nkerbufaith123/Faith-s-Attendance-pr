import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ATT_FILE = path.join(DATA_DIR, 'attendance.json');
const QR_FILE = path.join(DATA_DIR, 'qrSessions.json');

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ATT_FILE)) fs.writeFileSync(ATT_FILE, JSON.stringify({}), 'utf8');
  if (!fs.existsSync(QR_FILE)) fs.writeFileSync(QR_FILE, JSON.stringify({}), 'utf8');
}

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.warn('readJson error', e);
    return {};
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export function readAttendance() {
  ensureFiles();
  return readJson(ATT_FILE);
}

export function writeAttendance(data) {
  ensureFiles();
  writeJson(ATT_FILE, data);
}

export function readQrSessions() {
  ensureFiles();
  return readJson(QR_FILE);
}

export function writeQrSessions(data) {
  ensureFiles();
  writeJson(QR_FILE, data);
}
