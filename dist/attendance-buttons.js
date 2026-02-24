// Attendance Button Logic - Check-In & Check-Out Handler
(function() {
    // Get current time in HH:MM:SS format
    function getCurrentTime() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    // Format time from 24-hour to 12-hour format (HH:MM AM/PM)
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

    // Calculate work hours from check-in and check-out times (returns seconds)
    function calculateWorkHours(checkInTime, checkOutTime) {
        try {
            const parseTime = (timeStr) => {
                const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10) || 0);
                return h * 3600 + m * 60 + s;
            };

            let inSec = parseTime(checkInTime);
            let outSec = parseTime(checkOutTime);

            if (outSec < inSec) outSec += 24 * 3600;

            const diffSeconds = Math.max(0, outSec - inSec);
            return diffSeconds; // Return seconds for accurate HH:MM:SS conversion
        } catch (e) {
            return 0;
        }
    }

    // Format work duration from seconds to HH:MM:SS
    function formatWorkDuration(seconds) {
        if (!seconds || seconds === 0) return '00:00:00';
        const pad = (n) => String(n).padStart(2, '0');
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }

    // Toast notification
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

        // Auto-hide
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Update UI elements with fresh data
    function updateAttendanceUI() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        const userRecords = allRecords[userEmail] || {};
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = userRecords[today] || [];

        // Handle both array and object formats for backward compatibility
        let latestSession = null;
        if (Array.isArray(todaySessions)) {
            latestSession = todaySessions[todaySessions.length - 1] || null;
        } else if (typeof todaySessions === 'object' && todaySessions.checkInTime) {
            latestSession = todaySessions;
        }

        // Update Check-In (latest session's check-in)
        const checkInEl = document.getElementById('todayCheckIn');
        if (checkInEl && latestSession && latestSession.checkInTime) {
            checkInEl.textContent = formatTimeDisplay(latestSession.checkInTime);
        }

        // Update Check-Out (latest session's check-out)
        const checkOutEl = document.getElementById('todayCheckOut');
        if (checkOutEl && latestSession && latestSession.checkOutTime) {
            checkOutEl.textContent = formatTimeDisplay(latestSession.checkOutTime);
        }

        // Update Total Work Hours (sum of all sessions today)
        const workHoursEl = document.getElementById('todayWorkHours');
        if (workHoursEl) {
            let totalSeconds = 0;
            if (Array.isArray(todaySessions)) {
                todaySessions.forEach(session => {
                    if (session.workHours) totalSeconds += session.workHours;
                });
            } else if (typeof todaySessions === 'object' && todaySessions.workHours) {
                totalSeconds = todaySessions.workHours;
            }
            workHoursEl.textContent = totalSeconds > 0 ? formatWorkDuration(totalSeconds) : '—';
        }

        // Update Method (latest session's method)
        const methodEl = document.getElementById('todayMethod');
        if (methodEl && latestSession && latestSession.method) {
            methodEl.textContent = latestSession.method;
        }

        console.log('UI Updated - Latest Session:', latestSession, 'Total Sessions Today:', Array.isArray(todaySessions) ? todaySessions.length : 0);
    }

    // Get current user email from localStorage or currentUser
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

    // CHECK-IN BUTTON LOGIC - Allow multiple check-ins per day
    function handleCheckIn() {
        const userEmail = getCurrentUserEmail();
        if (!userEmail) {
            showToast('User not logged in', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const currentTime = getCurrentTime();

        // Get existing records
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        if (!allRecords[userEmail]) allRecords[userEmail] = {};
        
        // Initialize today's sessions as array if needed
        if (!Array.isArray(allRecords[userEmail][today])) {
            // Convert from old format if it exists
            if (allRecords[userEmail][today] && allRecords[userEmail][today].checkInTime) {
                allRecords[userEmail][today] = [allRecords[userEmail][today]];
            } else {
                allRecords[userEmail][today] = [];
            }
        }

        const todaySessions = allRecords[userEmail][today];

        // Check for active unclosed session (session without checkout)
        const activeSession = todaySessions.find(session => !session.checkOutTime);
        if (activeSession) {
            showToast('Active session already exists - please check out first', 'error');
            return;
        }

        // Create new session
        const newSession = {
            checkInTime: currentTime,
            checkInTimestamp: Date.now(),
            checkOutTime: null,
            checkOutTimestamp: null,
            workHours: null,
            method: 'Manual',
            status: 'Present'
        };

        todaySessions.push(newSession);

        // Save to localStorage
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        localStorage.setItem('userEmail', userEmail);

        // Show success message
        const displayTime = formatTimeDisplay(currentTime);
        showToast(`Successfully Checked In at ${displayTime}`, 'success');
        console.log('Check-In recorded at:', currentTime, 'Session #', todaySessions.length);

        // Update UI immediately
        setTimeout(() => {
            updateAttendanceUI();
        }, 100);
    }

    // CHECK-OUT BUTTON LOGIC - Support multiple check-outs per day
    // KEY RULE: Only block if NO active session exists (WHERE checkOutTime IS NULL)
    function handleCheckOut() {
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
            showToast('No active check-in session', 'error');
            return;
        }

        // Initialize today's sessions as array if needed
        if (!Array.isArray(allRecords[userEmail][today])) {
            if (allRecords[userEmail][today] && allRecords[userEmail][today].checkInTime) {
                allRecords[userEmail][today] = [allRecords[userEmail][today]];
            } else {
                allRecords[userEmail][today] = [];
            }
        }

        const todaySessions = allRecords[userEmail][today];

        // CRITICAL LOGIC: Find the LATEST session WITHOUT checkout (checkOutTime IS NULL)
        let activeSessionIndex = -1;
        for (let i = todaySessions.length - 1; i >= 0; i--) {
            if (todaySessions[i].checkInTime && !todaySessions[i].checkOutTime) {
                activeSessionIndex = i;
                break;
            }
        }

        // Block ONLY IF no active session exists
        if (activeSessionIndex === -1) {
            showToast('No active check-in session', 'error');
            return;
        }

        // Update the active session (and ONLY that session)
        const activeSession = todaySessions[activeSessionIndex];
        activeSession.checkOutTime = currentTime;
        activeSession.checkOutTimestamp = Date.now();
        if (!activeSession.method) {
            activeSession.method = 'Manual';
        }

        // Calculate work hours for this session only
        const workHours = calculateWorkHours(activeSession.checkInTime, currentTime);
        activeSession.workHours = workHours;

        // Save to localStorage
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        localStorage.setItem('userEmail', userEmail);

        // Calculate total work hours for all sessions today
        let totalSeconds = 0;
        todaySessions.forEach(session => {
            if (session.workHours) totalSeconds += session.workHours;
        });

        // Show success message with this session's hours
        const displayTime = formatTimeDisplay(currentTime);
        showToast(`Successfully Checked Out at ${displayTime} - Session: ${formatWorkDuration(workHours)} | Daily Total: ${formatWorkDuration(totalSeconds)}`, 'success');
        console.log('Check-Out recorded at:', currentTime, 'Session Hours:', formatWorkDuration(workHours), 'Total Hours:', formatWorkDuration(totalSeconds));

        // Update UI immediately
        setTimeout(() => {
            updateAttendanceUI();
        }, 100);
    }

    // Initialize buttons when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');

        if (checkInBtn) {
            checkInBtn.addEventListener('click', handleCheckIn);
            console.log('Check-In button initialized');
        }

        if (checkOutBtn) {
            checkOutBtn.addEventListener('click', handleCheckOut);
            console.log('Check-Out button initialized');
        }

        // Initial UI update
        updateAttendanceUI();
    });

    // Expose functions globally for debugging
    window.AttendanceButtons = {
        handleCheckIn,
        handleCheckOut,
        updateAttendanceUI,
        getCurrentUserEmail,
        formatTimeDisplay,
        calculateWorkHours
    };
})();
