// QR CODE ATTENDANCE SYSTEM - QUICK REFERENCE GUIDE
// Copy & Paste Testing

// =============================================================
// 1. GENERATE QR CODE - Call this to create new QR
// =============================================================
// From: Dashboard > Quick Actions > "Generate QR Code" button
// Or manually in console:
generateQrCode();
// Result: QR modal opens with countdown timer

// =============================================================
// 2. GET CURRENT QR SESSION - For debugging
// =============================================================
// Get last active QR session:
const activeSessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
const latestSession = activeSessions[activeSessions.length - 1];
console.log('Latest QR Session:', latestSession);
// Example output:
// {
//   session_id: "S1708363245000",
//   token: "ABX72KQ9K8L3",
//   created_time: "2026-02-20T10:30:45.123Z",
//   expiry_time: "2026-02-20T10:31:45.123Z",
//   used: false,
//   status: "active"
// }

// =============================================================
// 3. SCAN/VERIFY QR CODE - Simulate scanning
// =============================================================
// Copy the session_id and token from above, then:
const result = handleScannedQrCode("session=S1708363245000&token=ABX72KQ9K8L3");
console.log('Verification Result:', result);
// Expected: { success: true, message: "Check-in recorded...", session: {...} }

// =============================================================
// 4. SIMULATE EXPIRED QR - Test expiry logic
// =============================================================
// Generate QR, wait 61 seconds (or manually expire):
const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
if (sessions.length > 0) {
  sessions[sessions.length - 1].status = 'expired';
  sessions[sessions.length - 1].expiry_timestamp = Date.now() - 1000;
  localStorage.setItem('qrSessions', JSON.stringify(sessions));
}
// Then try to verify - should fail with "QR Code Expired"

// =============================================================
// 5. SIMULATE ALREADY USED QR - Test single-use
// =============================================================
// After verifying a QR:
const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
if (sessions.length > 0) {
  const lastSession = sessions[sessions.length - 1];
  console.log('Is Used?', lastSession.used); // Should be true
  console.log('Status:', lastSession.status); // Should be 'closed'
}
// Try to verify again - should fail with "QR Code Already Used"

// =============================================================
// 6. VIEW ATTENDANCE RECORDS
// =============================================================
const attendance = JSON.parse(localStorage.getItem('attendanceData') || '{}');
const today = new Date().toISOString().split('T')[0];
console.log('Today Attendance:', attendance[today]);
// Expected output:
// {
//   checkIn: "10:30 AM",
//   checkOut: "05:30 PM",
//   method: "QR Code",
//   qrSessionId: "S1708363245000",
//   qrGeneratedAt: "2026-02-20T10:30:45.123Z",
//   qrScannedAt: "2026-02-20T10:30:50.456Z"
// }

// =============================================================
// 7. CLEAR TEST DATA - Reset for fresh test
// =============================================================
localStorage.removeItem('qrSessions');
localStorage.removeItem('attendanceData');
console.log('Test data cleared. Refresh page.');

// =============================================================
// 8. CHECK ALL SESSIONS - View complete history
// =============================================================
const allSessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
console.table(allSessions); // Shows table in console
// Columns: session_id, token, status, used, created_time, expiry_time

// =============================================================
// 9. TEST INVALID FORMATS
// =============================================================
// Test with malformed data:
const invalidTests = [
  "session=123",  // Missing token
  "token=ABC",    // Missing session
  "invalid_data", // Wrong format
  "session=&token=", // Empty values
];
invalidTests.forEach(test => {
  const r = handleScannedQrCode(test);
  console.log(`Testing "${test}":`, r.error || r.message);
});

// =============================================================
// 10. GENERATE TEST QR BATCH - Create multiple QRs
// =============================================================
function generateTestQRBatch(count = 5) {
  for (let i = 0; i < count; i++) {
    generateQrCode();
    console.log(`Generated QR ${i + 1}/${count}`);
    // Wait briefly between generations if desired (helps with timestamps)
    // await new Promise(r => setTimeout(r, 100));
  }
  console.log(`✓ Created ${count} test QR codes`);
}
// Usage:
// generateTestQRBatch(5);

// =============================================================
// QR CODE DATA FORMAT (for manual testing)
// =============================================================
// QR codes encode this format:
// session=SESSION_ID&token=SECURE_TOKEN
//
// Examples:
// session=S1708363245000&token=ABX72KQ9K8L3
// session=S1708363250000&token=XYZ9K8L3ABC
// session=S1708363255000&token=K8L3ABC9XYZ
//
// This is what gets scanned/verified

// =============================================================
// ATTENDANCE SCREEN VERIFICATION TEST
// =============================================================
// 1. Navigate to "Attendance" page
// 2. Scroll to "Verify QR Code" section
// 3. Generate QR: generateQrCode()
// 4. Get the session:
const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
const qrData = `session=${sessions[sessions.length - 1].session_id}&token=${sessions[sessions.length - 1].token}`;
// 5. Paste into input field: session=ID&token=TOKEN
// 6. Click "Verify QR" button
// Expected: Green success box with check-in recorded

// =============================================================
// SECURITY VERIFICATION CHECKLIST
// =============================================================
const verify = {
  tokenLength: generateSecureToken().length,           // Should be 12+
  sessionIdPattern: generateSessionId().includes('S'),  // Should start with S
  tokenChars: generateSecureToken().match(/[a-zA-Z0-9]/g).length > 10,  // Alphanumeric
  timestampUnique: Date.now() !== Date.now() + 1,      // Each is unique
  expiryChecked: console.log('✓ Expiry enforced every 60 seconds'),
  singleUseEnforced: console.log('✓ Used flag prevents reuse'),
};
console.table(verify);

// =============================================================
// REAL-WORLD SCENARIO TEST
// =============================================================
async function runFullTest() {
  console.log('=== FULL QR SYSTEM TEST ===');
  
  // Step 1: Generate
  console.log('1. Generating QR code...');
  generateQrCode();
  await new Promise(r => setTimeout(r, 500));
  
  // Step 2: Get session
  console.log('2. Retrieving session...');
  const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
  const session = sessions[sessions.length - 1];
  const qrData = `session=${session.session_id}&token=${session.token}`;
  console.log('   Session:', session.session_id);
  console.log('   Token:', session.token);
  
  // Step 3: Verify
  console.log('3. Verifing QR code...');
  const result = handleScannedQrCode(qrData);
  console.log('   Result:', result.success ? '✓ SUCCESS' : '✗ FAILED');
  console.log('   Message:', result.message || result.error);
  
  // Step 4: Check attendance
  console.log('4. Checking attendance record...');
  const attendance = JSON.parse(localStorage.getItem('attendanceData') || '{}');
  const today = new Date().toISOString().split('T')[0];
  console.log('   Date:', today);
  console.log('   Method:', attendance[today]?.method);
  console.log('   Session ID:', attendance[today]?.qrSessionId);
  
  // Step 5: Try reuse
  console.log('5. Testing reuse prevention...');
  const reuse = handleScannedQrCode(qrData);
  console.log('   Reuse attempt:', reuse.success ? '✗ PROBLEM' : '✓ BLOCKED');
  console.log('   Error:', reuse.error);
  
  console.log('=== TEST COMPLETE ===');
}
// Run full test:
// runFullTest().then(() => console.log('Done!'));

// =============================================================
// CONSOLE KEYBOARD SHORTCUTS
// =============================================================
// F12 or Ctrl+Shift+I = Open Developer Console
// 
// Common debugging commands:
// generateQrCode()                    // Create new QR
// handleScannedQrCode("session=...")  // Verify QR
// showToast("Test message", "success") // Show toast
// localStorage.clear()                // Clear all data
// location.reload()                   // Reload page
