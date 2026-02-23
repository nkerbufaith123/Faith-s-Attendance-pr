// Unified Dashboard App.js
// Runs on ALL pages to maintain consistent experience

console.log('🚀 AttendancePro App initialized');

// ============================================
// 1. USER SESSION MANAGEMENT
// ============================================
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser');
    
    if (!currentUser) {
        console.warn('No user session found. Redirecting to login...');
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(currentUser);
}

// Initialize on page load
window.addEventListener('load', () => {
    const user = checkUserSession();
    if (user) {
        // Dynamically load attendance.js (logic file) before wiring rest of UI
        const script = document.createElement('script');
        script.src = 'attendance.js';
        script.onload = () => {
            try {
                if (typeof AttendanceModule !== 'undefined' && AttendanceModule && typeof AttendanceModule.init === 'function') {
                    AttendanceModule.init();
                }
            } catch (e) { console.warn('attendance.js init error', e); }

            // After attendance module initialized, load QR attendance logic
            const qrScript = document.createElement('script');
            qrScript.src = 'qr-attendance.js';
            qrScript.onload = () => {
                initializePageUI(user);
                setupLogout();
                setupProfileModal();
                setupInactivityLockout();
                setupQuickActionButtons();
            };
            qrScript.onerror = () => {
                console.warn('Failed to load qr-attendance.js — continuing');
                initializePageUI(user);
                setupLogout();
                setupProfileModal();
                setupInactivityLockout();
                setupQuickActionButtons();
            };
            document.head.appendChild(qrScript);
        };
        script.onerror = () => {
            console.warn('Failed to load attendance.js — continuing without it');
            initializePageUI(user);
            setupLogout();
            setupProfileModal();
            setupInactivityLockout();
            setupQuickActionButtons();
        };
        document.head.appendChild(script);
    }
});

// ============================================
// 2. PAGE UI INITIALIZATION
// ============================================
function initializePageUI(user) {
    console.log('📄 Initializing page UI for:', user.firstName);
    
    // Update user greeting
    const userFirstName = document.getElementById('userFirstName');
    const userEmail = document.getElementById('userEmail');
    if (userFirstName) userFirstName.textContent = user.firstName;
    if (userEmail) userEmail.textContent = user.email;
    const userFirstNameHeader = document.getElementById('userFirstNameHeader');
    const dashboardGreeting = document.getElementById('dashboardGreeting');
    if (userFirstNameHeader) userFirstNameHeader.textContent = user.firstName;
    if (dashboardGreeting) dashboardGreeting.textContent = `Welcome ${user.firstName}`;
    
    // Update profile picture
    const profilePicture = document.getElementById('profilePicture');
    const savedProfilePicture = localStorage.getItem(`profilePicture-${user.email}`);
    if (profilePicture) {
        if (savedProfilePicture) {
            profilePicture.src = savedProfilePicture;
        } else {
            profilePicture.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3FA9FF&color=fff`;
        }
    }
    
    // Highlight active sidebar item
    highlightActiveSidebar();
}

function highlightActiveSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
    
    // Special case for dashboard.html (also match index pages)
    if (currentPage === 'dashboard.html' || currentPage === '' || currentPage === '/') {
        sidebarItems.forEach(item => {
            if (item.getAttribute('href') === 'dashboard.html') {
                item.classList.add('active');
            }
        });
    }
}

// ============================================
// 3. LOGOUT FUNCTIONALITY
// ============================================
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('sessionUser');
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        });
    }
}

// Attach direct listeners for Quick Action buttons (Check In / Check Out)
function setupQuickActionButtons() {
    try {
        console.log('🔧 App: attaching quick action buttons');
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');

        if (checkInBtn) {
            checkInBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const now = new Date();
                const time = formatTime(now);
                if (typeof handleCheckIn === 'function') handleCheckIn();
                if (typeof showToast === 'function') showToast(`✓ Checked In at ${time}`, 'success');
                else console.log('Checked In at ' + time + ' (no toast function)');
            });
            console.log('✅ App: checkInBtn listener attached');
        }

        if (checkOutBtn) {
            checkOutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const now = new Date();
                const time = formatTime(now);
                if (typeof handleCheckOut === 'function') handleCheckOut();
                if (typeof showToast === 'function') showToast(`✓ Checked Out at ${time}`, 'success');
                else console.log('Checked Out at ' + time + ' (no toast function)');
            });
            console.log('✅ App: checkOutBtn listener attached');
        }
    } catch (err) {
        console.error('Failed to attach quick action buttons:', err);
    }
}

// ============================================
// 4. PROFILE MODAL
// ============================================
function setupProfileModal() {
    const profilePicture = document.getElementById('profilePicture');
    const modal = document.getElementById('profileModal');
    const modalClose = document.getElementById('modalClose');
    const uploadBtn = document.getElementById('uploadBtn');
    const profileInput = document.getElementById('profileInput');
    const previewImage = document.getElementById('previewImage');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const modalCancel = document.getElementById('modalCancel');
    const clearBtn = document.getElementById('clearBtn');
    
    if (!modal) return;
    
    if (profilePicture) {
        profilePicture.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            profileInput.value = '';
            const currentUser = JSON.parse(
                localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser')
            );
            previewImage.src = `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=3FA9FF&color=fff`;
            showToast('Image cleared', 'success');
        });
    }
    
    if (uploadBtn && profileInput) {
        uploadBtn.addEventListener('click', () => {
            profileInput.click();
        });
    }
    
    if (profileInput && previewImage) {
        profileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('File size must be less than 5MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const file = profileInput.files[0];
            if (!file) {
                showToast('Please select an image first', 'error');
                return;
            }
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const currentUser = JSON.parse(
                        localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser')
                    );
                    localStorage.setItem(`profilePicture-${currentUser.email}`, event.target.result);
                    const profileImg = document.getElementById('profilePicture');
                    if (profileImg) profileImg.src = event.target.result;
                    modal.classList.remove('active');
                    showToast('Profile picture updated', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ============================================
// 5. INACTIVITY LOCKOUT
// ============================================
let inactivityTimer = null;
const INACTIVITY_MINUTES = 15;

function setupInactivityLockout() {
    const ms = INACTIVITY_MINUTES * 60 * 1000;
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    const reset = () => resetInactivityTimer(ms);
    events.forEach(ev => window.addEventListener(ev, reset));
    reset();
}

function resetInactivityTimer(ms) {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        showToast('You were logged out due to inactivity', 'error');
        setTimeout(() => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('sessionUser');
            window.location.href = 'login.html';
        }, 900);
    }, ms);
}

// ============================================
// 6. DATA MANAGEMENT (localStorage)
// ============================================
function getAttendanceData() {
    return JSON.parse(localStorage.getItem('attendanceData') || '{}');
}

function saveAttendanceData(data) {
    localStorage.setItem('attendanceData', JSON.stringify(data));
}

function getReportsData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const key = `reports-${currentUser.email || 'anon'}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveReportsData(data) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const key = `reports-${currentUser.email || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(data));
}

// ============================================
// Time formatting utilities (12/24h)
// ============================================
function getTimeFormatSetting() {
    // '24' or '12' stored in localStorage; default to '12' (English 12-hour)
    return localStorage.getItem('timeFormat') || '12';
}

function formatTime(date) {
    const fmt = getTimeFormatSetting();
    if (!(date instanceof Date)) date = new Date(date);
    if (fmt === '12') {
        // en-US 12-hour with seconds
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    }
    // default 24-hour HH:MM:SS
    const hh = String(date.getHours()).padStart(2,'0');
    const mm = String(date.getMinutes()).padStart(2,'0');
    const ss = String(date.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
}

function formatTimeStr(timeStr) {
    // timeStr expected as 'HH:MM' or 'HH:MM:SS' in 24-hour form
    if (!timeStr) return '--';
    const parts = timeStr.split(':').map(p => parseInt(p,10));
    if (parts.length < 2) return timeStr;
    const date = new Date();
    date.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
    return formatTime(date);
}

function getTasksData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const key = `tasks-${currentUser.email || 'anon'}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveTasksData(data) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const key = `tasks-${currentUser.email || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(data));
}

// ============================================
// 7. TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ============================================
// 8. UTILITY FUNCTIONS
// ============================================
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString();
}
// ============================================
// 9. QR CODE VALIDATION (Shared Functions)
// ============================================

// Validate QR session (called when QR is scanned/verified)
function validateQrSession(sessionId, token) {
    const now = new Date().getTime();
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const session = sessions.find(s => s.session_id === sessionId);
    
    // Validation checks
    if (!session) {
        return {
            valid: false,
            error: 'Session Not Found',
            message: 'Invalid session ID. QR code does not exist in system.'
        };
    }
    
    if (session.token !== token) {
        return {
            valid: false,
            error: 'Invalid QR Code',
            message: 'Token mismatch. QR code is invalid.'
        };
    }
    
    if (session.status === 'expired' || session.expiry_timestamp < now) {
        return {
            valid: false,
            error: 'QR Code Expired',
            message: 'This QR code has expired. Please generate a new one.'
        };
    }
    
    if (session.used) {
        return {
            valid: false,
            error: 'QR Code Already Used',
            message: 'This QR code has already been used. Please generate a new one.'
        };
    }
    
    if (session.status !== 'active') {
        return {
            valid: false,
            error: 'Invalid QR Code',
            message: 'This QR code is no longer active.'
        };
    }
    
    return {
        valid: true,
        session: session
    };
}

// Mark QR session as used
function markQrSessionUsed(sessionId) {
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
        session.used = true;
        session.status = 'closed';
        session.used_at = new Date().toISOString();
    }
    localStorage.setItem('qrSessions', JSON.stringify(sessions));
}

// Handle scanned QR code (parse session=ID&token=TOKEN format)
function handleScannedQrCode(qrData) {
    // Parse QR data format: session=ID&token=TOKEN
    const params = new URLSearchParams(qrData);
    const sessionId = params.get('session');
    const token = params.get('token');
    
    if (!sessionId || !token) {
        return {
            success: false,
            error: 'Invalid QR Format',
            message: 'QR code format is invalid.'
        };
    }
    
    // Prefer server-side verification
    try {
        return fetch('/api/qr/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, token }) })
        .then(r => r.json()).then(res => {
            if (res && res.success) {
                recordQrCheckIn(res.session || { session_id: sessionId });
                return { success: true, message: 'Check-in recorded successfully via QR code', session: res.session || { session_id: sessionId } };
            }

            // fallback local
            const validation = validateQrSession(sessionId, token);
            if (!validation.valid) return { success: false, error: validation.error, message: validation.message };
            markQrSessionUsed(sessionId);
            recordQrCheckIn(validation.session);
            return { success: true, message: 'Check-in recorded (local)', session: validation.session };
        }).catch(err => {
            console.warn('QR verify server error, falling back to local:', err);
            const validation = validateQrSession(sessionId, token);
            if (!validation.valid) return { success: false, error: validation.error, message: validation.message };
            markQrSessionUsed(sessionId);
            recordQrCheckIn(validation.session);
            return { success: true, message: 'Check-in recorded (local)', session: validation.session };
        });
    } catch (e) {
        const validation = validateQrSession(sessionId, token);
        if (!validation.valid) return { success: false, error: validation.error, message: validation.message };
        markQrSessionUsed(sessionId);
        recordQrCheckIn(validation.session);
        return { success: true, message: 'Check-in recorded (local)', session: validation.session };
    }
}

// Record check-in from QR scan
function recordQrCheckIn(session) {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    
    if (!attendanceData[today]) attendanceData[today] = {};
    
    // Only update if no check-in exists or update the existing one
    if (!attendanceData[today].checkIn) {
        attendanceData[today].checkIn = time;
    }
    
    attendanceData[today].method = 'QR Code';
    attendanceData[today].qrSessionId = session.session_id;
    attendanceData[today].qrScannedAt = new Date().toISOString();
    
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    
    showToast('✓ Attendance verified via QR code', 'success');
}