// Sidebar Navigation Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Set active sidebar link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (href === 'dashboard.html' && currentPage === '')) {
            link.classList.add('active');
        }
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    
    if (mobileMenuBtn && dashboardSidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            dashboardSidebar.classList.toggle('active');
        });
        
        // Close sidebar when a link is clicked
        const sidebarLinks = dashboardSidebar.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    dashboardSidebar.classList.remove('active');
                }
            });
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !dashboardSidebar.contains(e.target) && 
                e.target !== mobileMenuBtn &&
                !mobileMenuBtn.contains(e.target)) {
                dashboardSidebar.classList.remove('active');
            }
        });
    }
});

// Dashboard Initialization and Logic

// Check if user is logged in
window.addEventListener('load', () => {
    console.log('🚀 Dashboard page loading...');
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser');
    
    if (!currentUser) {
        console.warn('⚠️ No logged-in user. Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ User found. Initializing dashboard...');
    const user = JSON.parse(currentUser);
    initializeDashboard(user);
});
// Responsive Hamburger Menu Logic
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        // Show hamburger only on mobile
        function updateMenuVisibility() {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.style.display = 'flex';
                mobileMenu.style.display = 'flex';
            } else {
                mobileMenuBtn.style.display = 'none';
                mobileMenu.classList.remove('open');
                mobileMenu.style.display = 'none';
            }
        }
        updateMenuVisibility();
        window.addEventListener('resize', updateMenuVisibility);

        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('open');
        });
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
                mobileMenu.classList.remove('open');
            }
        });
    }
});

function initializeDashboard(user) {
    console.log('📦 Initializing dashboard for user:', user.firstName, user.email);
    
    // Display user info
    const userFirstName = document.getElementById('userFirstName');
    const userFirstNameHeader = document.getElementById('userFirstNameHeader');
    if (userFirstName) userFirstName.textContent = user.firstName;
    if (userFirstNameHeader) userFirstNameHeader.textContent = user.firstName;

    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = user.email;
    
    // Set profile picture if exists
    const profilePicture = document.getElementById('profilePicture');
    const savedProfilePicture = localStorage.getItem(`profilePicture-${user.email}`);
    if (savedProfilePicture && profilePicture) {
        profilePicture.src = savedProfilePicture;
    } else if (profilePicture) {
        // Use name-based avatar
        profilePicture.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3FA9FF&color=fff`;
    }
    
    // Initialize dashboard data
    console.log('📊 Initializing stats and activities...');
    initializeStats();
    initializeActivity(user);
    
    // Sync tasks from admin-created task list
    if (window.TaskManager && window.TaskManager.syncUserTasks) {
        console.log('🔄 Syncing tasks from admin task list...');
        window.TaskManager.syncUserTasks();
    }
    
    setupLogout();
    
    console.log('🔗 Setting up navigation and modals...');
    setupSidebarNavigation();
    setupProfileModal();
    if (typeof setupInactivityLockout === 'function') setupInactivityLockout();
    
    console.log('⚙️ Setting up sections (attendance, tasks, reports, settings)...');
    setupAttendanceSection();
    setupTaskSection();
    setupAccountSettings();
    
    console.log('⚙️ Setting up Quick Action buttons...');
    setupQuickActionButtons();
    
    console.log('⚙️ Setting up QR Modal handlers...');
    setupQrModalHandlers();
    
    console.log('🎬 Showing initial dashboard view...');
    showSection('dashboard');
    // Removed seedSampleData - all data should be created only when user takes actions
    
    console.log('✅ Dashboard initialized successfully!');
}

// Disabled prefilled sample data - new accounts start completely blank
// All data is created only when user takes actual actions (check-in, report submission, task assignment)
function seedSampleData(user) {
    // This function is intentionally empty
    // Data generation now happens only on user actions, not on account creation
}


function renderReports() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const key = `reports-${currentUser.email || 'anon'}`;
    const list = document.getElementById('reportList');
    if (!list) return;
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    if (reports.length === 0) {
        list.innerHTML = '<p>No reports for today.</p>';
        return;
    }
    list.innerHTML = reports.map(r => `
        <div class="activity-item">
            <div class="activity-content">
                <div class="activity-title">${r.title}</div>
                <div class="activity-time">${r.time}</div>
                <div class="activity-desc">${r.description}</div>
            </div>
        </div>
    `).join('');
}

// Compute lightweight report summaries from attendance using AttendanceManager
function updateReportSummaries() {
    const totalHours = calculateWorkHours();
    const attendancePct = calculateMonthlyAttendance();
    const points = Math.round(attendancePct / 10); // simple point system

    const totalHoursEl = document.getElementById('reportTotalHours');
    const pctEl = document.getElementById('reportAttendancePct');
    const pointsEl = document.getElementById('reportPoints');
    const prodEl = document.getElementById('reportProductivity');

    if (totalHoursEl) totalHoursEl.textContent = `${totalHours}h`;
    if (pctEl) pctEl.textContent = `${attendancePct}%`;
    if (pointsEl) pointsEl.textContent = `${points}`;

    let summary = 'Balanced productivity.';
    let recommendation = '';
    if (attendancePct >= 90) { summary = 'Attendance consistency is excellent'; recommendation = 'Keep up the strong punctuality.'; }
    else if (attendancePct >= 75) { summary = 'Attendance is good'; recommendation = 'Consider improving check-in punctuality.'; }
    else { summary = 'Attendance needs attention'; recommendation = 'Set reminders and review daily start times.'; }

    if (prodEl) prodEl.innerHTML = `<div style="font-size:0.95rem">${summary}</div><div style="color:var(--text-secondary); font-size:0.85rem; margin-top:6px">${recommendation}</div>`;
}

// Ensure attendance panel is initialized
function setupAttendanceSection() {
    // Render today's attendance and history
    renderAttendanceToday();
    // Setup filters
    const btnToday = document.getElementById('attendanceFilterToday');
    const btnWeek = document.getElementById('attendanceFilterWeek');
    const btnMonth = document.getElementById('attendanceFilterMonth');
    if (btnToday) btnToday.addEventListener('click', () => renderAttendanceHistory('today'));
    if (btnWeek) btnWeek.addEventListener('click', () => renderAttendanceHistory('week'));
    if (btnMonth) btnMonth.addEventListener('click', () => renderAttendanceHistory('month'));
    // Initial history view: past week
    renderAttendanceHistory('week');
}

function renderAttendanceHistory(range = 'week') {
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    const entries = Object.entries(attendanceData).sort((a,b)=>b[0].localeCompare(a[0]));
    const now = new Date();
    const cutoff = new Date();

    if (range === 'today') {
        cutoff.setDate(now.getDate() - 0);
    } else if (range === 'week') {
        cutoff.setDate(now.getDate() - 7);
    } else if (range === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
    }

    const filtered = entries.filter(([date]) => {
        const d = new Date(date);
        return d >= cutoff;
    });

    const historyEl = document.getElementById('attendanceHistory');
    if (!historyEl) return;
    if (filtered.length === 0) {
        historyEl.innerHTML = '<p>No attendance records for the selected range.</p>';
        return;
    }

    historyEl.innerHTML = filtered.map(([date,data]) => {
        const method = data.method ? data.method : 'Manual';
        return `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-title">${date}</div>
                    <div class="activity-time">Check-in: ${data.checkIn || '--'} &nbsp;|&nbsp; Check-out: ${data.checkOut || '--'}</div>
                    <div class="activity-time" style="margin-top:6px;color:var(--text-secondary)">Type: ${method}</div>
                </div>
            </div>`;
    }).join('');
}
// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (!section) return; // Skip if no data-section attribute
            
            // Update active state
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show the requested section
            showSection(section);
            logActivity(`Navigated to ${section}`, '<i class="bi bi-geo-alt"></i>');
        });
    });
}

function showSection(section) {
    console.log('🔄 showSection called with:', section);
    const dashboardMain = document.getElementById('dashboardMain');
    if (!dashboardMain) {
        console.error('dashboardMain element not found!');
        return;
    }

    // Hide all panels
    document.querySelectorAll('.section-panel').forEach(p => { 
        p.style.display = 'none'; 
        p.classList.remove('active'); 
    });

    if (section === 'dashboard') {
        dashboardMain.style.display = '';
        console.log('✅ Dashboard view activated');
        initializeStats();
    } else {
        dashboardMain.style.display = 'none';
        const panelId = `section-${section}`;
        const panel = document.getElementById(panelId);
        
        if (panel) { 
            panel.style.display = 'block'; 
            panel.classList.add('active');
            console.log(`✅ Panel ${panelId} shown`);
        } else {
            console.error(`❌ Panel ${panelId} not found!`);
        }
        
        // Render section content
        if (section === 'attendance') {
            console.log('📋 Rendering attendance section...');
            renderAttendanceToday();
            renderAttendanceHistory('week');
        }
        if (section === 'reports') { 
            console.log('📊 Rendering reports section...');
            renderReports(); 
            updateReportSummaries(); 
        }
        if (section === 'task') {
            console.log('✓ Rendering task section...');
            renderTasks();
        }
        if (section === 'settings') {
            console.log('⚙️ Rendering account settings...');
            setupAccountSettings();
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Inactivity lockout (auto-logout after inactivity)
let inactivityTimer = null;
const INACTIVITY_MINUTES = 15; // timeout in minutes
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

// Setup profile modal
function setupProfileModal() {
    const profilePicture = document.getElementById('profilePicture');
    const modal = document.getElementById('profileModal');
    const modalClose = document.getElementById('modalClose');
    const uploadBtn = document.getElementById('uploadBtn');
    const profileInput = document.getElementById('profileInput');
    const previewImage = document.getElementById('previewImage');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const modalCancel = document.getElementById('modalCancel');
    
    if (!modal) return;
    
    // Open modal when clicking profile picture
        if (profilePicture) {
        profilePicture.addEventListener('click', () => {
            modal.classList.add('active');
            logActivity('Opened profile settings', '<i class="bi bi-gear-fill"></i>');
        });
    }
    
    // Close modal
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
    
    // Upload button triggers file input
    if (uploadBtn && profileInput) {
        uploadBtn.addEventListener('click', () => {
            profileInput.click();
        });
    }
    
    // Handle file selection and preview
    if (profileInput && previewImage) {
        profileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('File size must be less than 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Please select a valid image file', 'error');
            }
        });
    }
    
    // Save profile picture
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const file = profileInput.files[0];
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
                    showToast('Profile picture updated successfully!', 'success');
                    logActivity('Updated profile picture', '<i class="bi bi-card-image"></i>');
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Please select a valid image file', 'error');
            }
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function initializeStats() {
    // Now using AttendanceManager API for per-user data
    // The updateUI() from attendance-manager.js will handle stat updates
    renderAttendanceToday();
}

function calculateWorkHours() {
    // Use AttendanceManager API for per-user work hours
    if (window.AttendanceManager && window.AttendanceManager.getTodayAttendance) {
        const todayAttendance = window.AttendanceManager.getTodayAttendance();
        if (todayAttendance && todayAttendance.workHours) {
            return parseFloat(todayAttendance.workHours).toFixed(1);
        }
    }
    return '0.0';
}

function calculateMonthlyAttendance() {
    // Use AttendanceManager API for monthly attendance percentage
    if (window.AttendanceManager && window.AttendanceManager.getMonthlyAttendance) {
        const monthly = window.AttendanceManager.getMonthlyAttendance();
        return monthly.percentage || 0;
    }
    return 0;
}

function initializeActivity(user) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser'));
    const createdAt = new Date(currentUser.createdAt);
    const now = new Date();
    const timeDiff = now - createdAt;
    
    let timeString = 'Just now';
    
    if (timeDiff > 60000) {
        const minutes = Math.floor(timeDiff / 60000);
        if (minutes < 60) {
            timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.floor(minutes / 60);
            timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
    }
    
    document.getElementById('createdTime').textContent = timeString;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    const logout = () => {
        // Clear session
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('sessionUser');
        
        // Redirect to login
        window.location.href = 'login.html';
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', logout);
    }
}
// ============================================
// QUICK ACTION BUTTONS SETUP
// ============================================

function setupQuickActionButtons() {
    console.log('🔧 Setting up Quick Action event listeners...');
    
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const generateQrBtn = document.getElementById('generateQrBtn');
    
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleCheckIn();
        });
        console.log('✅ Check-In button listener attached');
    } else {
        console.error('❌ CHECK-IN BUTTON NOT FOUND IN DOM!');
    }
    
    if (checkOutBtn) {
        // Checkout listener is handled by checkout-handler-v2.js
        console.log('ℹ️ Check-Out button listener handled by checkout-handler-v2.js');
    } else {
        console.warn('⚠️ CHECK-OUT BUTTON NOT FOUND IN DOM');
    }
    
    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateQrCode();
        });
        console.log('✅ Generate QR Code button listener attached');
    } else {
        console.warn('⚠️ Generate QR Code button not found');
    }
}

function handleCheckIn() {
    console.log('📍 CHECK-IN TRIGGERED');
    
    try {
        // Get user email
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
        const userEmail = currentUser.email || localStorage.getItem('userEmail');
        if (!userEmail) {
            showToast('User not logged in', 'error');
            return;
        }
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Get current time in HH:MM:SS format
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        
        console.log(`Check-In at ${today}, ${time}`);
        
        // Get attendance records using per-user structure
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        if (!allRecords[userEmail]) allRecords[userEmail] = {};
        const todayRecord = allRecords[userEmail][today] || {};
        
        console.log('Today record before:', todayRecord);
        
        // Validation: Check if already checked in
        if (todayRecord.checkInTime) {
            const msg = `Already Checked In today`;
            console.warn('⚠️ ' + msg);
            showToast(msg, 'warning');
            return;
        }
        
        // SAVE CHECK-IN to correct storage
        if (!allRecords[userEmail][today]) {
            allRecords[userEmail][today] = {};
        }
        allRecords[userEmail][today].checkInTime = time;
        allRecords[userEmail][today].checkInTimestamp = Date.now();
        allRecords[userEmail][today].method = 'Manual';
        allRecords[userEmail][today].status = 'Present';
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        localStorage.setItem('userEmail', userEmail);
        console.log('✅ CHECK-IN SAVED:', allRecords[userEmail][today]);

        showToast(`✓ Successfully Checked In at ${time}`, 'success');
        logActivity(`Checked In at ${time}`, '<i class="bi bi-box-arrow-in-right"></i>');
        
        // Refresh display
        setTimeout(() => {
            renderAttendanceToday();
            initializeStats();
        }, 100);
        
    } catch (error) {
        console.error('❌ CHECK-IN ERROR:', error);
        showToast('Error during check-in: ' + error.message, 'error');
    }
}

function handleCheckOut() {
    // DISABLED - checkout-handler.js handles all checkouts now
    console.log('⚠️ Old handleCheckOut() in dashboard.js - DISABLED. Using checkout-handler.js');
}

/**
 * Sync attendance with PHP backend
 */
function syncAttendanceWithServer(action, time, date) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
        const email = currentUser.email || 'anon';
        
        const payload = {
            action: action,
            email: email,
            date: date,
            time: time,
            method: 'Manual',
            timestamp: new Date().toISOString()
        };
        
        console.log('🔄 Syncing with server:', payload);

        // Choose endpoint based on action
        let endpoint = '/api/checkin';
        if (action === 'checkout') endpoint = '/api/checkout';

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, date, time, method: 'Manual' })
        })
        .then(response => {
            console.log('✓ Server response:', response.status);
            if (!response.ok) {
                console.warn('⚠️ Server returned error, but local data is SAFE');
            }
        })
        .catch(err => {
            console.warn('⚠️ Server sync failed (local data intact):', err);
        });
        
    } catch (error) {
        console.warn('⚠️ Sync error:', error);
    }
}

// ============================================
// QR CODE SESSION MANAGEMENT & GENERATION
// ============================================

// Generate secure random token
function generateSecureToken(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        token += chars[randomIndex];
    }
    return token;
}

// Generate unique session ID
function generateSessionId() {
    return 'S' + Date.now() + Math.floor(Math.random() * 10000);
}

// Create new QR session with proper security
function createQrSession() {
    const sessionId = generateSessionId();
    const token = generateSecureToken(14);
    const now = new Date();
    const expiryTime = now.getTime() + (60 * 1000); // 60 second expiry
    
    const session = {
        session_id: sessionId,
        // copyable, human-friendly QR identifier
        qr_id: `QR-${Math.floor(10000 + Math.random() * 90000)}-${token ? token.slice(0,6) : ''}`,
        token: token,
        created_time: now.toISOString(),
        expiry_time: new Date(expiryTime).toISOString(),
        used: false,
        status: 'active',
        created_timestamp: now.getTime(),
        expiry_timestamp: expiryTime
    };
    
    return session;
}

// Store QR session
function storeQrSession(session) {
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    sessions.push(session);
    localStorage.setItem('qrSessions', JSON.stringify(sessions));
}

// Get current active QR session for user
function getCurrentQrSession() {
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const now = new Date().getTime();
    
    // Get the last active session
    for (let i = sessions.length - 1; i >= 0; i--) {
        const session = sessions[i];
        if (session.status === 'active' && !session.used && session.expiry_timestamp > now) {
            return session;
        }
    }
    return null;
}

// QR code generation with complete security features
function generateQrCode() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    // Try to create QR session on server first
    const modal = document.getElementById('qrModal');
    const img = document.getElementById('qrImage');
    const info = document.getElementById('qrInfo');
    const statusVal = document.getElementById('qrStatusValue');

    fetch('/api/qr/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email || 'anon' })
    }).then(r => r.json()).then(res => {
        let session = null;
        if (res && res.success && res.session) {
            session = res.session;
        } else {
            // fallback to local session
            session = createQrSession();
            storeQrSession(session);
        }

        const qrData = `session=${session.session_id}&token=${session.token}`;
        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=350x350&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;

        if (img) img.src = qrUrl;
        if (info) info.textContent = `Session: ${session.session_id} | User: ${currentUser.email || 'you'} | Generated: ${new Date().toLocaleTimeString()}`;
        if (modal) modal.classList.add('active');
        if (statusVal) statusVal.textContent = 'Active';

        // Start countdown timer
        startQrCountdown(session);

        // Populate copyable QR id field (if present)
        const qrIdInput = document.getElementById('qrIdInput');
        const copyBtn = document.getElementById('copyQrIdBtn');
        if (qrIdInput) qrIdInput.value = session.qr_id || session.session_id;
        if (copyBtn && qrIdInput) {
            copyBtn.onclick = () => {
                try { navigator.clipboard.writeText(qrIdInput.value); showToast('QR ID copied to clipboard', 'success'); }
                catch (e) { qrIdInput.select(); document.execCommand('copy'); showToast('QR ID copied', 'success'); }
            };
        }

        showToast('QR code generated successfully', 'success');
        logActivity('Generated QR code', '<i class="bi bi-upc-scan"></i>');

        // Record QR generation as attendance action (use HH:MM:SS format)
        const now = new Date();
        const time = (typeof formatTime === 'function') ? formatTime(now) : `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        recordQrGeneration(session, time);
    }).catch(err => {
        // fallback entirely local
        const session = createQrSession();
        storeQrSession(session);
        const qrData = `session=${session.session_id}&token=${session.token}`;
        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=350x350&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;
        if (img) img.src = qrUrl;
        if (info) info.textContent = `Session: ${session.session_id} | User: ${currentUser.email || 'you'} | Generated: ${new Date().toLocaleTimeString()}`;
        if (modal) modal.classList.add('active');
        if (statusVal) statusVal.textContent = 'Active';
        startQrCountdown(session);
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        recordQrGeneration(session, time);
    });

    // Populate copyable QR id field (if present)
    const qrIdInput = document.getElementById('qrIdInput');
    const copyBtn = document.getElementById('copyQrIdBtn');
    if (qrIdInput) qrIdInput.value = session.qr_id || session.session_id;
    if (copyBtn && qrIdInput) {
        copyBtn.onclick = () => {
            try {
                navigator.clipboard.writeText(qrIdInput.value);
                showToast('QR ID copied to clipboard', 'success');
            } catch (e) {
                // Fallback select
                qrIdInput.select();
                document.execCommand('copy');
                showToast('QR ID copied', 'success');
            }
        };
    }

    showToast('QR code generated successfully', 'success');
    logActivity('Generated QR code', '<i class="bi bi-upc-scan"></i>');

    // Record QR generation as attendance action (use HH:MM:SS format)
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    recordQrGeneration(session, time);
}

// Start countdown timer for QR expiry
function startQrCountdown(session) {
    const countdownEl = document.getElementById('qrCountdown');
    const statusEl = document.getElementById('qrStatusValue');
    const regenerateBtn = document.getElementById('regenerateQrBtn');
    
    let secondsLeft = 60;
    
    const countdown = setInterval(() => {
        secondsLeft--;
        if (countdownEl) countdownEl.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdown);
            if (statusEl) statusEl.textContent = 'Expired';
            if (statusEl) statusEl.style.color = '#ef4444';
            if (countdownEl) countdownEl.parentElement.style.color = '#ef4444';
            if (regenerateBtn) regenerateBtn.style.display = 'inline-block';
            
            // Mark session as expired
            markSessionExpired(session.session_id);
        }
    }, 1000);
}

// Mark session as expired
function markSessionExpired(sessionId) {
    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
        session.status = 'expired';
    }
    localStorage.setItem('qrSessions', JSON.stringify(sessions));
}

// Record QR generation as attendance (generating QR = starting check-in)
function recordQrGeneration(session, time) {
    const today = new Date().toISOString().split('T')[0];
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    
    if (!attendanceData[today]) attendanceData[today] = {};
    
    // Record check-in via QR generation
    attendanceData[today].checkIn = time;
    attendanceData[today].method = 'QR Code';
    attendanceData[today].qrSessionId = session.session_id;
    attendanceData[today].qrGeneratedAt = new Date().toISOString();
    
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    initializeStats();

    // Try to persist on server as a check-in record
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
        const email = currentUser.email || 'anon';
        fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, date: today, time, method: 'QR Code', qrSessionId: session.session_id }) })
        .then(r => r.json()).then(res => {
            if (res && res.success) console.log('Server recorded QR check-in:', res);
        }).catch(err => console.warn('Server QR check-in failed:', err));
    } catch (e) {
        console.warn('QR server check-in attempt failed:', e);
    }
}

// ============================================
// QR CODE VALIDATION & SCANNING
// ============================================

// Validate QR session (called when QR is scanned)
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

// Mark QR session as used (after successful validation)
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

// Handle scanned QR code (process the data: session=ID&token=TOKEN)
function handleScannedQrCode(qrData) {
    // Accept two input styles:
    // 1) full data: session=ID&token=TOKEN
    // 2) simple QR id: QR-12345-ABCDEF (or raw session id)
    let sessionId = null;
    let token = null;
    let foundSession = null;

    try {
        const params = new URLSearchParams(qrData);
        if (params.get('session') && params.get('token')) {
            sessionId = params.get('session');
            token = params.get('token');
        }
    } catch (e) {
        // Not URLSearchParams format
    }

    const sessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
    if (!sessionId) {
        // try to match by qr_id or session_id directly
        foundSession = sessions.find(s => s.qr_id === qrData || s.session_id === qrData);
        if (foundSession) {
            sessionId = foundSession.session_id;
            token = foundSession.token;
        }
    }

    if (!sessionId || !token) {
        return {
            success: false,
            error: 'Invalid QR Format',
            message: 'QR code data is not recognized.'
        };
    }

    // Prefer server-side verification
    try {
        return fetch('/api/qr/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, token })
        }).then(r => r.json()).then(res => {
            if (res && res.success) {
                // Server verified and (server) marked used
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
                // Save local copy and update UI
                saveAttendanceRecord('checkin', 'QR Code', time);
                initializeStats();
                logActivity(`Checked in via QR Code (Session: ${res.session ? res.session.session_id : sessionId})`, '<i class="bi bi-upc-scan"></i>');
                return { success: true, message: 'QR Attendance Successful', session: res.session || { session_id: sessionId } };
            }

            // fallback to local validation
            const validation = validateQrSession(sessionId, token);
            if (!validation.valid) {
                return { success: false, error: validation.error, message: validation.message };
            }

            markQrSessionUsed(sessionId);
            const now = new Date();
            const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            saveAttendanceRecord('checkin', 'QR Code', time);
            return { success: true, message: 'QR Attendance Successful (local)', session: validation.session };
        }).catch(err => {
            // server not reachable, fallback to local validation
            console.warn('⚠️ QR verify server error, falling back to local:', err);
            const validation = validateQrSession(sessionId, token);
            if (!validation.valid) {
                return { success: false, error: validation.error, message: validation.message };
            }
            markQrSessionUsed(sessionId);
            const now = new Date();
            const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            saveAttendanceRecord('checkin', 'QR Code', time);
            return { success: true, message: 'QR Attendance Successful (local)', session: validation.session };
        });
    } catch (e) {
        const validation = validateQrSession(sessionId, token);
        if (!validation.valid) {
            return { success: false, error: validation.error, message: validation.message };
        }
        markQrSessionUsed(sessionId);
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        saveAttendanceRecord('checkin', 'QR Code', time);
        return { success: true, message: 'QR Attendance Successful (local)', session: validation.session };
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
    logActivity(`Checked in via QR Code (Session: ${session.session_id})`, '<i class="bi bi-upc-scan"></i>');
    initializeStats();
}

// Unified attendance record saver: tries server then falls back to localStorage
function saveAttendanceRecord(actionType, method, time) {
    const today = new Date().toISOString().split('T')[0];
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const email = currentUser.email || 'anon';

    // Prepare body for server
    const body = { action: actionType, email, date: today, time, method };

    // Always save locally first
    applyLocalAttendanceSave(today, actionType, method, time);
    
    // Show success message
    const actionMsg = actionType === 'checkin' ? 'Check In' : actionType === 'checkout' ? 'Check Out' : 'Recorded';
    showToast(`Successfully ${actionMsg}`, 'success');
    
    // Update UI
    initializeStats();
    logActivity(`${capitalize(actionType)} at ${time} (${method})`, '<i class="bi bi-clock"></i>');
    
    // Try to sync with server in background, but don't block UI
    let endpoint = '/api/checkin';
    if (actionType === 'checkout') endpoint = '/api/checkout';

    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, date: today, time, method }) })
    .catch(err => {
        // Server sync failed, but local data is already saved
        console.log('Server sync failed (local save intact):', err);
    });
}

function applyLocalAttendanceSave(today, actionType, method, time) {
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    if (!attendanceData[today]) attendanceData[today] = {};
    if (actionType === 'checkin') {
        attendanceData[today].checkIn = time;
        attendanceData[today].checkInRecordedAt = new Date().toISOString();
    } else if (actionType === 'checkout') {
        attendanceData[today].checkOut = time;
        attendanceData[today].checkOutRecordedAt = new Date().toISOString();
    } else if (actionType === 'qr') {
        // record QR generation; if no checkIn exists, mark checkIn via QR
        attendanceData[today].qrGeneratedAt = new Date().toISOString();
        if (!attendanceData[today].checkIn) attendanceData[today].checkIn = time;
    }
    attendanceData[today].method = method;
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    // Update small UI
    const statusEl = document.getElementById('todayStatus');
    if (statusEl) statusEl.textContent = attendanceData[today].checkIn ? 'Checked In' : 'Not Checked In';
    renderAttendanceToday();
    // Refresh analytics summaries
    if (typeof updateReportSummaries === 'function') updateReportSummaries();
}

function capitalize(s) { return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ============================================
// QR MODAL HANDLERS SETUP
// ============================================

function setupQrModalHandlers() {
    console.log('🔧 Setting up QR Modal event listeners...');
    
    // QR modal close handlers
    const qrModalClose = document.getElementById('qrModalClose');
    const closeQrBtn = document.getElementById('closeQrBtn');
    const regenerateQrBtn = document.getElementById('regenerateQrBtn');
    const qrScannerClose = document.getElementById('qrScannerClose');
    const qrScannerVerifyBtn = document.getElementById('qrScannerVerifyBtn');
    const qrScannerCancelBtn = document.getElementById('qrScannerCancelBtn');

    if (qrModalClose) {
        qrModalClose.addEventListener('click', ()=>{ const m=document.getElementById('qrModal'); if(m) m.classList.remove('active'); });
        console.log('✅ QR Modal Close (X) listener attached');
    }
    
    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', ()=>{ const m=document.getElementById('qrModal'); if(m) m.classList.remove('active'); });
        console.log('✅ QR Modal Close button listener attached');
    }
    
    if (regenerateQrBtn) {
        regenerateQrBtn.addEventListener('click', ()=>{ 
            document.getElementById('qrModal').classList.remove('active');
            setTimeout(() => generateQrCode(), 300);
        });
        console.log('✅ QR Regenerate button listener attached');
    }

    // QR Scanner Modal handlers
    if (qrScannerClose) {
        qrScannerClose.addEventListener('click', ()=>{ const m=document.getElementById('qrScannerModal'); if(m) m.classList.remove('active'); });
        console.log('✅ QR Scanner Close (X) listener attached');
    }
    
    if (qrScannerCancelBtn) {
        qrScannerCancelBtn.addEventListener('click', ()=>{ const m=document.getElementById('qrScannerModal'); if(m) m.classList.remove('active'); });
        console.log('✅ QR Scanner Cancel button listener attached');
    }

    if (qrScannerVerifyBtn) {
        qrScannerVerifyBtn.addEventListener('click', () => {
            const input = document.getElementById('qrScannerInput');
            const resultDiv = document.getElementById('qrScannerResult');
            const qrData = input.value.trim();
            
            if (!qrData) {
                showToast('Please paste QR code data', 'error');
                return;
            }
            
            const result = handleScannedQrCode(qrData);
            
            if (result.success) {
                resultDiv.innerHTML = `
                    <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:6px; padding:1rem; color:#22C55E;">
                        <strong>✓ Verified Successfully</strong><br>
                        ${result.message}<br>
                        <small style="color:var(--text-secondary); display:block; margin-top:0.5rem;">Session: ${result.session.session_id}</small>
                    </div>
                `;
                input.value = '';
                setTimeout(() => {
                    document.getElementById('qrScannerModal').classList.remove('active');
                    initializeStats();
                }, 1500);
            } else {
                resultDiv.innerHTML = `
                    <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:1rem; color:#ef4444;">
                        <strong>✕ Verification Failed</strong><br>
                        <strong>${result.error}:</strong> ${result.message}
                    </div>
                `;
            }
            resultDiv.style.display = 'block';
        });
        console.log('✅ QR Scanner Verify button listener attached');
    }
}

// Render today's attendance and history
function renderAttendanceToday() {
    const attendanceTimes = document.getElementById('attendanceTimes');
    
    // Use AttendanceManager API for per-user attendance data
    if (window.AttendanceManager) {
        const todayRec = window.AttendanceManager.getTodayAttendance();
        
        if (attendanceTimes) {
            if (todayRec && (todayRec.checkInTime || todayRec.checkOutTime)) {
                const method = todayRec.method || 'Manual';
                const checkIn = todayRec.checkInTime ? window.AttendanceManager.formatTimeDisplay(todayRec.checkInTime) : '—';
                const checkOut = todayRec.checkOutTime ? window.AttendanceManager.formatTimeDisplay(todayRec.checkOutTime) : '—';
                attendanceTimes.innerHTML = `Checked In: ${checkIn}<br>Checked Out: ${checkOut}<br><small style="color:var(--text-secondary)">Attendance method: ${method}</small>`;
            } else {
                attendanceTimes.textContent = 'No records for today';
            }
        }
    } else {
        if (attendanceTimes) {
            attendanceTimes.textContent = 'No records for today';
        }
}

// Task handling
function setupTaskSection() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const newTaskInput = document.getElementById('newTaskInput');
    if (addTaskBtn && newTaskInput) {
        addTaskBtn.addEventListener('click', () => {
            addTask(newTaskInput.value.trim());
            newTaskInput.value = '';
        });
    }
    // Open Submit Task modal
    const openSubmitTaskBtn = document.getElementById('openSubmitTaskBtn');
    const submitModal = document.getElementById('submitTaskModal');
    const submitModalClose = document.getElementById('submitTaskModalClose');
    const submitTaskCancel = document.getElementById('submitTaskCancel');
    const submitTaskBtnEl = document.getElementById('submitTaskBtn');
    if (openSubmitTaskBtn && submitModal) {
        openSubmitTaskBtn.addEventListener('click', () => {
            submitModal.classList.add('active');
        });
    }
    if (submitModalClose) submitModalClose.addEventListener('click', ()=> submitModal.classList.remove('active'));
    if (submitTaskCancel) submitTaskCancel.addEventListener('click', ()=> submitModal.classList.remove('active'));
    if (submitTaskBtnEl) {
        submitTaskBtnEl.addEventListener('click', ()=>{
            const code = document.getElementById('taskCode').value.trim();
            const title = document.getElementById('taskTitle').value.trim();
            const name = document.getElementById('taskName').value.trim();
            const duration = document.getElementById('taskDuration').value.trim();
            if (!title && !name) { showToast('Please provide a task title or name', 'error'); return; }
            const payload = { code, title, name, duration, completed: false, createdAt: Date.now() };
            addTask(payload);
            submitModal.classList.remove('active');
            // clear form
            document.getElementById('taskCode').value = '';
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskName').value = '';
            document.getElementById('taskDuration').value = '';
        });
    }
    renderTasks();
}

function getTasksKey() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    return `tasks-${currentUser.email || 'anon'}`;
}

function renderTasks() {
    const key = getTasksKey();
    const tasks = JSON.parse(localStorage.getItem(key) || '[]');
    const list = document.getElementById('taskList');
    if (!list) return;
    list.innerHTML = tasks.map((t, idx) => `
        <div class="activity-item" data-idx="${idx}">
            <div style="flex:1">
                <div class="activity-title">${t.title || t.name || '—'}</div>
                <div class="activity-time">${t.code ? `Code: ${t.code} • ` : ''}${t.duration ? `Duration: ${t.duration} • ` : ''}${t.completed ? 'Completed' : 'Pending'}</div>
            </div>
            <div style="display:flex; gap:0.5rem">
                <button class="btn-secondary" data-action="toggle" data-idx="${idx}">${t.completed ? 'Undo' : 'Complete'}</button>
                <button class="btn-primary" data-action="delete" data-idx="${idx}">Delete</button>
            </div>
        </div>
    `).join('');

    // Attach handlers
    list.querySelectorAll('button[data-action]').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            const action = btn.getAttribute('data-action');
            const idx = parseInt(btn.getAttribute('data-idx'));
            if (action === 'toggle') toggleTaskComplete(idx);
            if (action === 'delete') deleteTask(idx);
        });
    });
    // Update overview summary
    updateTaskOverview();
}

function updateTaskOverview() {
    const key = getTasksKey();
    const tasks = JSON.parse(localStorage.getItem(key) || '[]');
    const assigned = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = assigned - completed;
    const pct = assigned === 0 ? 0 : Math.round((completed / assigned) * 100);

    const assignedEl = document.getElementById('taskAssigned');
    const completedEl = document.getElementById('taskCompleted');
    const pendingEl = document.getElementById('taskPending');
    const progressBar = document.getElementById('taskProgressBar');

    if (assignedEl) assignedEl.textContent = assigned;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
    if (progressBar) progressBar.style.width = pct + '%';
}

function addTask(title) {
    if (!title) { showToast('Task cannot be empty', 'error'); return; }
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const email = currentUser.email;
    const payload = typeof title === 'object' ? title : { title, completed: false, createdAt: Date.now() };
    // attempt server add
    fetch('api/tasks.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ action: 'add', email, task: payload })
    }).then(r=>r.json()).then(res=>{
        if (res && res.success) { renderTasks(); showToast('Task added', 'success'); updateTaskOverview(); }
        else {
            // fallback local
            const key = getTasksKey();
            const tasks = JSON.parse(localStorage.getItem(key) || '[]');
            tasks.unshift(payload);
            localStorage.setItem(key, JSON.stringify(tasks));
            renderTasks();
            updateTaskOverview();
            showToast('Task added (local)', 'success');
        }
    }).catch(err=>{
        const key = getTasksKey();
        const tasks = JSON.parse(localStorage.getItem(key) || '[]');
        tasks.unshift(payload);
        localStorage.setItem(key, JSON.stringify(tasks));
        renderTasks();
        updateTaskOverview();
        showToast('Task added (local)', 'success');
    });
}

function toggleTaskComplete(idx) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const email = currentUser.email;
    fetch('api/tasks.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action: 'toggle', email, idx })
    }).then(r=>r.json()).then(res=>{
        if (res.success) { renderTasks(); showToast('Task updated', 'success'); }
        else {
            // fallback local
            const key = getTasksKey();
            const tasks = JSON.parse(localStorage.getItem(key) || '[]');
            if (!tasks[idx]) return;
            tasks[idx].completed = !tasks[idx].completed;
            localStorage.setItem(key, JSON.stringify(tasks));
            renderTasks();
        }
    }).catch(err=>{
        const key = getTasksKey();
        const tasks = JSON.parse(localStorage.getItem(key) || '[]');
        if (!tasks[idx]) return;
        tasks[idx].completed = !tasks[idx].completed;
        localStorage.setItem(key, JSON.stringify(tasks));
        renderTasks();
    });
}

function deleteTask(idx) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const email = currentUser.email;
    fetch('api/tasks.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action: 'delete', email, idx })
    }).then(r=>r.json()).then(res=>{
        if (res.success) {
            renderTasks(); showToast('Task removed', 'success');
        } else {
            const key = getTasksKey();
            const tasks = JSON.parse(localStorage.getItem(key) || '[]');
            tasks.splice(idx,1);
            localStorage.setItem(key, JSON.stringify(tasks));
            renderTasks();
        }
    }).catch(err=>{
        const key = getTasksKey();
        const tasks = JSON.parse(localStorage.getItem(key) || '[]');
        tasks.splice(idx,1);
        localStorage.setItem(key, JSON.stringify(tasks));
        renderTasks();
    });
}

// Reports submission
const submitReportBtn = document.getElementById('submitReportBtn');
if (submitReportBtn) {
    submitReportBtn.addEventListener('click', () => {
        const title = document.getElementById('reportTitle').value.trim();
        const desc = document.getElementById('reportDesc').value.trim();
        if (!title || !desc) { showToast('Please provide title and description', 'error'); return; }
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
        const email = currentUser.email;
        fetch('api/reports.php', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ action: 'submit', email, title, description: desc })
        }).then(r=>r.json()).then(res=>{
            if (res.success) {
                showToast('Report submitted', 'success');
                document.getElementById('reportTitle').value = '';
                document.getElementById('reportDesc').value = '';
                renderReports();
            } else {
                // fallback to local
                const key = `reports-${currentUser.email || 'anon'}`;
                const list = JSON.parse(localStorage.getItem(key) || '[]');
                const now = new Date();
                list.unshift({ title, description: desc, time: now.toLocaleTimeString() });
                localStorage.setItem(key, JSON.stringify(list));
                showToast('Report submitted (local)', 'success');
                document.getElementById('reportTitle').value = '';
                document.getElementById('reportDesc').value = '';
                renderReports();
            }
        }).catch(err=>{
            const key = `reports-${currentUser.email || 'anon'}`;
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const now = new Date();
            list.unshift({ title, description: desc, time: now.toLocaleTimeString() });
            localStorage.setItem(key, JSON.stringify(list));
            showToast('Report submitted (local)', 'success');
            document.getElementById('reportTitle').value = '';
            document.getElementById('reportDesc').value = '';
            renderReports();
        });
    });
}

// Account settings
function setupAccountSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser') || '{}');
    const setFirstName = document.getElementById('setFirstName');
    const setLastName = document.getElementById('setLastName');
    const setEmail = document.getElementById('setEmail');
    const setUsername = document.getElementById('setUsername');
    const setLanguage = document.getElementById('setLanguage');
    const prefNotifications = document.getElementById('prefNotifications');
    const prefReminders = document.getElementById('prefReminders');
    const saveAccountBtn = document.getElementById('saveAccountBtn');
    const openProfileModal = document.getElementById('openProfileModal');

    if (setFirstName) setFirstName.value = currentUser.firstName || '';
    if (setLastName) setLastName.value = currentUser.lastName || '';
    if (setEmail) setEmail.value = currentUser.email || '';
    if (setUsername) setUsername.value = currentUser.username || '';
    if (setLanguage) setLanguage.value = (currentUser.language || 'en');
    const prefs = currentUser.preferences || {};
    if (prefNotifications) prefNotifications.checked = !!prefs.notifications;
    if (prefReminders) prefReminders.checked = !!prefs.reminders;

    if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', ()=>{
            const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('sessionUser'));
            if (!user) return;
            user.firstName = setFirstName.value.trim() || user.firstName;
            user.lastName = setLastName.value.trim() || user.lastName;
            user.username = setUsername ? setUsername.value.trim() || user.username : user.username;
            user.language = setLanguage ? setLanguage.value : user.language;
            user.preferences = {
                notifications: prefNotifications ? !!prefNotifications.checked : false,
                reminders: prefReminders ? !!prefReminders.checked : false
            };
            // Attempt to save to server, fallback to localStorage on error
            fetch('api/account.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', user })
            }).then(r => r.json()).then(res => {
                if (res && res.success) {
                    // Update local copy too
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    sessionStorage.setItem('sessionUser', JSON.stringify(user));
                    document.getElementById('userFirstName').textContent = user.firstName;
                    document.getElementById('userFirstNameHeader').textContent = user.firstName;
                    showToast('Account updated', 'success');
                    logActivity('Updated account info (server)', '<i class="bi bi-person-check"></i>');
                } else {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    sessionStorage.setItem('sessionUser', JSON.stringify(user));
                    document.getElementById('userFirstName').textContent = user.firstName;
                    document.getElementById('userFirstNameHeader').textContent = user.firstName;
                    showToast('Account updated (local)', 'success');
                    logActivity('Updated account info (local)', '<i class="bi bi-person-check"></i>');
                }
            }).catch(err => {
                // fallback local
                localStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('sessionUser', JSON.stringify(user));
                document.getElementById('userFirstName').textContent = user.firstName;
                document.getElementById('userFirstNameHeader').textContent = user.firstName;
                showToast('Account updated (local)', 'success');
                logActivity('Updated account info (local)', '<i class="bi bi-person-check"></i>');
            });
        });
    }

    if (openProfileModal) {
        openProfileModal.addEventListener('click', ()=>{
            const modal = document.getElementById('profileModal');
            if (modal) modal.classList.add('active');
        });
    }
}

// Checklist functionality
document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
    // Load saved state
    const savedState = localStorage.getItem(`checklist-${checkbox.id}`);
    if (savedState === 'true') {
        checkbox.checked = true;
    }
    
    // Save state on change
    checkbox.addEventListener('change', () => {
        localStorage.setItem(`checklist-${checkbox.id}`, checkbox.checked);
    });
});

console.log('✨ Dashboard loaded successfully');

// Activity Logging
function logActivity(action, icon = '<i class="bi bi-pin-angle"></i>') {
    const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
    
    activityLog.unshift({
        action,
        icon,
        time,
        timestamp: now.getTime()
    });
    
    // Keep only last 50 activities
    if (activityLog.length > 50) {
        activityLog.pop();
    }
    
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    updateActivityDisplay();
}

function updateActivityDisplay() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
    
    activityList.innerHTML = activityLog.slice(0, 10).map(item => `
        <div class="activity-item">
            <div class="activity-icon">${item.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${item.action}</div>
                <div class="activity-time">${item.time}</div>
            </div>
        </div>
    `).join('');
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
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

// Delegated click handler fallback for Quick Actions
(function() {
    console.log('🔁 Quick Action delegation fallback active');
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = (btn.dataset && btn.dataset.action) ? btn.dataset.action : btn.getAttribute('data-action');

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

        if (action === 'checkin') {
            e.preventDefault();
            if (typeof handleCheckIn === 'function') {
                handleCheckIn();
            } else {
                console.error('handleCheckIn() is not defined');
            }
            if (typeof showToast === 'function') showToast(`✓ Checked In at ${time}`, 'success');
            return;
        }

        if (action === 'checkout') {
            e.preventDefault();
            if (typeof handleCheckOut === 'function') {
                handleCheckOut();
            } else {
                console.error('handleCheckOut() is not defined');
            }
            if (typeof showToast === 'function') showToast(`✓ Checked Out at ${time}`, 'success');
            return;
        }

        if (action === 'generate-qr') {
            e.preventDefault();
            if (typeof generateQrCode === 'function') {
                generateQrCode();
            } else {
                console.warn('generateQrCode() is not defined');
            }
            if (typeof showToast === 'function') showToast(`✓ QR Generated at ${time}`, 'success');
            return;
        }
    }, false);
})();
