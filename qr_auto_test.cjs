const fs = require('fs');
const vm = require('vm');

// Read dashboard.js
const code = fs.readFileSync('dashboard.js', 'utf8');

// Simple in-memory localStorage stub
const storage = {};
const localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Minimal element stub factory
function makeEl(id) {
  return {
    id,
    textContent: '',
    value: '',
    src: '',
    style: {},
    parentElement: { style: {} },
    classList: { add: () => {}, remove: () => {} },
    addEventListener: () => {},
    select: () => {},
    focus: () => {},
  };
}

const elements = new Proxy({}, {
  get: (t, name) => {
    if (!t[name]) t[name] = makeEl(name);
    return t[name];
  }
});

// minimal navigator.clipboard
const navigator = {
  clipboard: {
    writeText: async (txt) => { storage.__clipboard = txt; }
  }
};

// Minimal helper functions used by dashboard.js
const logs = [];
function showToast(msg, type='info') { logs.push({type:'toast', msg, level:type}); }
function logActivity(a) { logs.push({type:'activity', a}); }
function initializeStats() { logs.push({type:'initStats'}); }
function updateReportSummaries() {}
function renderAttendanceToday() {}
function setupQrModalHandlers() {}
function setupQuickActionButtons() {}
function setupSidebarNavigation() {}
function setupProfileModal() {}
function setupAttendanceSection() {}
function setupTaskSection() {}
function setupAccountSettings() {}

// Stub window and document
const sandbox = {
  console,
  localStorage,
  sessionStorage: { getItem: () => null },
  navigator,
  // collect 'load' callbacks then invoke after the script loads
  __windowLoadCbs: [],
  window: {
    addEventListener: (ev, cb) => { if (ev === 'load' || ev === 'DOMContentLoaded') { this.__windowLoadCbs.push(cb); } }
  },
  document: {
    getElementById: (id) => elements[id] || makeEl(id),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => makeEl(tag),
    body: {}
  },
  showToast,
  logActivity,
  initializeStats,
  updateReportSummaries,
  renderAttendanceToday,
  setupQrModalHandlers,
  setupQuickActionButtons,
  setupSidebarNavigation,
  setupProfileModal,
  setupAttendanceSection,
  setupTaskSection,
  setupAccountSettings,
  Date,
  URLSearchParams,
  setInterval,
  setTimeout,
  clearInterval,
  clearTimeout,
  INACTIVITY_MINUTES: 15,
};

// Expose a fake currentUser in localStorage
localStorage.setItem('currentUser', JSON.stringify({ firstName: 'Test', lastName: 'User', email: 'test@example.com' }));

// Run the dashboard.js code in VM
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// Run queued window load callbacks now that script executed
try {
  const cbs = sandbox.__windowLoadCbs || [];
  for (const cb of cbs) {
    try { cb(); } catch (e) { console.error('Error in load callback:', e); }
  }
} catch (e) { }

(async () => {
  try {
    // 1) Generate QR
    if (typeof sandbox.generateQrCode !== 'function') throw new Error('generateQrCode not found');
    sandbox.generateQrCode();
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const last = sessions[sessions.length-1];

    console.log('=== QR Generation Result ===');
    console.log('session:', last.session_id);
    console.log('qr_id:', last.qr_id || '(none)');
    console.log('token:', last.token);

    // 2) Verify using full payload
    const qrData = `session=${last.session_id}&token=${last.token}`;
    if (typeof sandbox.handleScannedQrCode !== 'function') throw new Error('handleScannedQrCode not found');
    const res1 = sandbox.handleScannedQrCode(qrData);
    console.log('\n=== First Verification (full payload) ===');
    console.log(res1);
    console.log('Attendance today:', JSON.parse(localStorage.getItem('attendanceData') || '{}')[new Date().toISOString().split('T')[0]]);

    // 3) Re-verify same QR (should fail)
    const res2 = sandbox.handleScannedQrCode(qrData);
    console.log('\n=== Second Verification (re-use) ===');
    console.log(res2);

    // 4) Generate another QR and verify via QR ID
    sandbox.generateQrCode();
    const sessions2 = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const last2 = sessions2[sessions2.length-1];
    console.log('\n=== Second QR Generation ===');
    console.log('session:', last2.session_id);
    console.log('qr_id:', last2.qr_id);
    const res3 = sandbox.handleScannedQrCode(last2.qr_id);
    console.log('\n=== Verification via QR ID ===');
    console.log(res3);

    // 5) Attempt reuse of QR ID
    const res4 = sandbox.handleScannedQrCode(last2.qr_id);
    console.log('\n=== Reuse of QR ID (should fail) ===');
    console.log(res4);

    console.log('\n=== Logs Summary ===');
    console.log(logs.slice(-20));

  } catch (e) {
    console.error('Test runner error:', e);
  }
})();
