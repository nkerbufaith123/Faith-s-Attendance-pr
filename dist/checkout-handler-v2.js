// ============================================
// CHECKOUT HANDLER V2 - REAL-TIME UPDATES
// Works on Dashboard AND Attendance pages
// Updates display every second after checkout
// ============================================

(function() {
    'use strict';

    // Real-time update interval
    let realtimeCheckoutInterval = null;

    // Utility Functions
    function getCurrentTime() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    function formatTimeDisplay(timeStr) {
        if (!timeStr) return '—';
        try {
            const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10) || 0);
            const period = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
        } catch (e) {
            return '—';
        }
    }

    function calculateWorkHours(checkInTime, checkOutTime) {
        try {
            const parseTime = (timeStr) => {
                const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10) || 0);
                return h * 3600 + m * 60 + s;
            };

            let inSec = parseTime(checkInTime);
            let outSec = parseTime(checkOutTime);

            if (outSec < inSec) {
                outSec += 24 * 3600;
            }

            const diffSeconds = Math.max(0, outSec - inSec);
            const hours = diffSeconds / 3600;
            return Math.round(hours * 100) / 100;
        } catch (e) {
            return 0;
        }
    }

    function getToastContainer() {
        let c = document.querySelector('.toast-container');
        if (!c) {
            c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function showToast(message, type = 'success') {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function getCurrentUserEmail() {
        let email = localStorage.getItem('userEmail');
        if (!email) {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                email = currentUser.email;
            } catch (e) {
                console.error('Could not get user email:', e);
            }
        }
        return email;
    }

    // ============================================
    // REAL-TIME UPDATE FUNCTION
    // ============================================
    function startRealtimeCheckoutUpdates() {
        console.log('⏱️ Starting real-time checkout updates every second...');

        // Clear any existing interval
        if (realtimeCheckoutInterval) {
            clearInterval(realtimeCheckoutInterval);
        }

        // Update every second
        realtimeCheckoutInterval = setInterval(() => {
            const userEmail = getCurrentUserEmail();
            if (!userEmail) return;

            const today = new Date().toISOString().split('T')[0];
            const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
            const todayRec = allRecords[userEmail] && allRecords[userEmail][today];

            if (todayRec && todayRec.checkOutTime) {
                const displayTime = formatTimeDisplay(todayRec.checkOutTime);
                const workHours = todayRec.workHours || '—';

                // Update DASHBOARD elements
                const todayStatusEl = document.getElementById('todayStatus');
                if (todayStatusEl) {
                    const currentText = todayStatusEl.textContent;
                    const newText = `Checked Out ${displayTime}`;
                    if (currentText !== newText) {
                        todayStatusEl.textContent = newText;
                    }
                }

                const workHoursEl = document.getElementById('workHours');
                if (workHoursEl) {
                    const hoursText = workHours + 'h';
                    const currentText = workHoursEl.textContent;
                    if (currentText !== hoursText) {
                        workHoursEl.textContent = hoursText;
                    }
                }

                // Update ATTENDANCE PAGE elements
                const checkOutEl = document.getElementById('todayCheckOut');
                if (checkOutEl) {
                    const currentText = checkOutEl.textContent;
                    if (currentText !== displayTime) {
                        checkOutEl.textContent = displayTime;
                    }
                }

                const attWorkHoursEl = document.getElementById('todayWorkHours');
                if (attWorkHoursEl) {
                    const hoursText = workHours + 'h';
                    const currentText = attWorkHoursEl.textContent;
                    if (currentText !== hoursText) {
                        attWorkHoursEl.textContent = hoursText;
                    }
                }
            }
        }, 1000); // Update every 1 second
    }

    // Stop real-time updates
    function stopRealtimeCheckoutUpdates() {
        if (realtimeCheckoutInterval) {
            clearInterval(realtimeCheckoutInterval);
            realtimeCheckoutInterval = null;
            console.log('⏹️ Real-time checkout updates stopped');
        }
    }

    // ============================================
    // MAIN CHECKOUT HANDLER
    // ============================================
    function handleCheckOut() {
        console.log('🔴 CHECKOUT TRIGGERED');

        const userEmail = getCurrentUserEmail();
        if (!userEmail) {
            showToast('User not logged in', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const currentTime = getCurrentTime();

        // Get existing records
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        if (!allRecords[userEmail]) {
            allRecords[userEmail] = {};
        }

        const userTodayRec = allRecords[userEmail][today];

        // Validate check-in exists
        if (!userTodayRec || !userTodayRec.checkInTime) {
            showToast('Please check in first', 'error');
            return;
        }

        // Validate not already checked out
        if (userTodayRec.checkOutTime) {
            showToast('Already checked out today', 'error');
            return;
        }

        // Calculate work hours
        const workHours = calculateWorkHours(userTodayRec.checkInTime, currentTime);

        // Save checkout to storage
        allRecords[userEmail][today].checkOutTime = currentTime;
        allRecords[userEmail][today].checkOutTimestamp = Date.now();
        allRecords[userEmail][today].workHours = workHours;
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        console.log('💾 Checkout saved:', allRecords[userEmail][today]);

        // Show success message
        const displayTime = formatTimeDisplay(currentTime);
        const message = `✓ Checked Out at ${displayTime}. Work hours: ${workHours}h`;
        showToast(message, 'success');

        // Update UI immediately
        updateDashboardCheckoutUI();
        updateAttendanceCheckoutUI();

        // Start real-time updates
        startRealtimeCheckoutUpdates();

        // Also call AttendanceManager if available
        if (window.AttendanceManager && typeof window.AttendanceManager.updateUI === 'function') {
            setTimeout(() => {
                window.AttendanceManager.updateUI();
            }, 500);
        }
    }

    function updateDashboardCheckoutUI() {
        const userEmail = getCurrentUserEmail();
        if (!userEmail) return;

        const today = new Date().toISOString().split('T')[0];
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        const todayRec = allRecords[userEmail] && allRecords[userEmail][today];

        if (!todayRec) return;

        const displayTime = formatTimeDisplay(todayRec.checkOutTime);
        const workHours = todayRec.workHours || '—';

        const todayStatusEl = document.getElementById('todayStatus');
        if (todayStatusEl) {
            todayStatusEl.textContent = `Checked Out ${displayTime}`;
        }

        const workHoursEl = document.getElementById('workHours');
        if (workHoursEl) {
            workHoursEl.textContent = workHours + 'h';
        }
    }

    function updateAttendanceCheckoutUI() {
        const userEmail = getCurrentUserEmail();
        if (!userEmail) return;

        const today = new Date().toISOString().split('T')[0];
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        const todayRec = allRecords[userEmail] && allRecords[userEmail][today];

        if (!todayRec) return;

        const displayTime = formatTimeDisplay(todayRec.checkOutTime);
        const workHours = todayRec.workHours || '—';

        const checkOutEl = document.getElementById('todayCheckOut');
        if (checkOutEl) {
            checkOutEl.textContent = displayTime;
        }

        const attWorkHoursEl = document.getElementById('todayWorkHours');
        if (attWorkHoursEl) {
            attWorkHoursEl.textContent = workHours + 'h';
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initializeCheckoutHandler() {
        console.log('🚀 Initializing Checkout Handler V2...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupCheckoutListener);
        } else {
            setupCheckoutListener();
        }
    }

    function setupCheckoutListener() {
        const checkOutBtn = document.getElementById('checkOutBtn');
        if (!checkOutBtn) {
            console.warn('⚠️ Check-Out button not found, will retry...');
            setTimeout(setupCheckoutListener, 500);
            return;
        }

        console.log('✅ Check-Out button found, attaching listener...');

        // Remove all old listeners by cloning
        const newBtn = checkOutBtn.cloneNode(true);
        checkOutBtn.parentNode.replaceChild(newBtn, checkOutBtn);

        // Attach single listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleCheckOut();
        });

        console.log('✅ Checkout Handler V2 ready!');

        // Check if already checked out and start real-time updates
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
            const today = new Date().toISOString().split('T')[0];
            const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
            const todayRec = allRecords[userEmail] && allRecords[userEmail][today];

            if (todayRec && todayRec.checkOutTime) {
                console.log('✅ Already checked out today, starting real-time updates');
                startRealtimeCheckoutUpdates();
            }
        }
    }

    // Expose globally
    window.CheckoutHandlerV2 = {
        handleCheckOut,
        startRealtimeCheckoutUpdates,
        stopRealtimeCheckoutUpdates,
        getCurrentUserEmail,
        formatTimeDisplay,
        calculateWorkHours
    };

    // INITIALIZE
    initializeCheckoutHandler();
})();
