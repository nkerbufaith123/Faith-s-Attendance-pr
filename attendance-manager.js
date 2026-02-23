// Comprehensive Attendance Management System (Per-User)
(function(){
    const STORAGE_KEY = 'attendanceRecords';
    const HISTORY_KEY = 'attendanceHistory';

    // ============================================
    // 1. UTILITY FUNCTIONS
    // ============================================

    function getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            return user && user.email ? user.email : null;
        } catch (e) {
            return null;
        }
    }

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function getCurrentTime() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    function getCurrentTimestamp() {
        return Date.now();
    }

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
            const hours = diffSeconds / 3600;
            return Math.round(hours * 100) / 100;
        } catch (e) {
            return 0;
        }
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

    // ============================================
    // 2. STORAGE MANAGEMENT (PER-USER)
    // ============================================

    function getAttendanceRecords(userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        if (!userEmail) return {};
        try {
            const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return allRecords[userEmail] || {};
        } catch (e) {
            return {};
        }
    }

    function getAttendanceHistory(userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        if (!userEmail) return [];
        try {
            const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
            return allHistory[userEmail] || [];
        } catch (e) {
            return [];
        }
    }

    function saveAttendanceRecords(records, userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        if (!userEmail) return;
        const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allRecords[userEmail] = records;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    }

    function saveAttendanceHistory(history, userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        if (!userEmail) return;
        const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
        allHistory[userEmail] = history;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
    }

    // ============================================
    // 3. ATTENDANCE ACTIONS
    // ============================================

    function recordLogin() {
        const userEmail = getCurrentUser();
        if (!userEmail) return;

        const today = getToday();
        const time = getCurrentTime();
        const timestamp = getCurrentTimestamp();

        const history = getAttendanceHistory(userEmail);
        
        if (!history.find(h => h.type === 'login' && h.date === today)) {
            history.push({
                type: 'login',
                timestamp,
                time,
                date: today
            });
            saveAttendanceHistory(history, userEmail);
        }
    }

    function recordLogout() {
        const userEmail = getCurrentUser();
        if (!userEmail) return;

        const today = getToday();
        const time = getCurrentTime();
        const timestamp = getCurrentTimestamp();

        const history = getAttendanceHistory(userEmail);
        
        if (!history.find(h => h.type === 'logout' && h.date === today)) {
            history.push({
                type: 'logout',
                timestamp,
                time,
                date: today
            });
            saveAttendanceHistory(history, userEmail);
        }
    }

    function manualCheckIn() {
        const userEmail = getCurrentUser();
        if (!userEmail) return { success: false, message: 'User not logged in' };

        const today = getToday();
        const time = getCurrentTime();
        const timestamp = getCurrentTimestamp();

        const records = getAttendanceRecords(userEmail);
        const history = getAttendanceHistory(userEmail);

        // Initialize today's sessions as array if needed
        if (!Array.isArray(records[today])) {
            if (records[today] && records[today].checkInTime) {
                records[today] = [records[today]];
            } else {
                records[today] = [];
            }
        }

        const todaySessions = records[today];

        // Check for active session (unchecked-out session)
        const activeSession = todaySessions.find(session => !session.checkOutTime);
        if (activeSession) {
            return { success: false, message: 'Already checked in - please check out first' };
        }

        // Create new session
        const newSession = {
            checkInTime: time,
            checkInTimestamp: timestamp,
            method: 'Manual',
            status: 'Present'
        };

        todaySessions.push(newSession);

        history.push({
            type: 'check-in',
            timestamp,
            time,
            date: today,
            method: 'Manual'
        });

        saveAttendanceRecords(records, userEmail);
        saveAttendanceHistory(history, userEmail);
        updateUI();

        return { success: true, message: `Checked in at ${formatTimeDisplay(time)} - Session #${todaySessions.length}`, time };
    }

    function manualCheckOut() {
        const userEmail = getCurrentUser();
        if (!userEmail) return { success: false, message: 'User not logged in' };

        const today = getToday();
        const time = getCurrentTime();
        const timestamp = getCurrentTimestamp();

        const records = getAttendanceRecords(userEmail);
        const history = getAttendanceHistory(userEmail);

        if (!records[today]) {
            return { success: false, message: 'Please check in first' };
        }

        // Initialize today's sessions as array if needed
        if (!Array.isArray(records[today])) {
            if (records[today] && records[today].checkInTime) {
                records[today] = [records[today]];
            } else {
                records[today] = [];
            }
        }

        const todaySessions = records[today];

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
            return { success: false, message: 'No active check-in session' };
        }

        // Update the active session (and ONLY that session)
        const activeSession = todaySessions[activeSessionIndex];
        activeSession.checkOutTime = time;
        activeSession.checkOutTimestamp = timestamp;
        if (!activeSession.method) activeSession.method = 'Manual';

        const workHours = calculateWorkHours(activeSession.checkInTime, activeSession.checkOutTime);
        activeSession.workHours = workHours;

        history.push({
            type: 'check-out',
            timestamp,
            time,
            date: today,
            method: activeSession.method
        });

        saveAttendanceRecords(records, userEmail);
        saveAttendanceHistory(history, userEmail);
        updateUI();

        // Calculate total work hours for all sessions today
        let totalSeconds = 0;
        todaySessions.forEach(session => {
            if (session.workHours) totalSeconds += session.workHours;
        });

        return { success: true, message: `Checked out at ${formatTimeDisplay(time)} - Session: ${formatWorkDuration(workHours)} | Daily Total: ${formatWorkDuration(totalSeconds)}`, time };
    }

    function recordQRAttendance(qrCode) {
        const userEmail = getCurrentUser();
        if (!userEmail) return { success: false, message: 'User not logged in' };

        const today = getToday();
        const time = getCurrentTime();
        const timestamp = getCurrentTimestamp();

        const records = getAttendanceRecords(userEmail);
        const history = getAttendanceHistory(userEmail);

        if (!records[today]) {
            records[today] = {};
        }

        if (!records[today].checkInTime && !records[today].checkOutTime) {
            records[today].checkInTime = time;
            records[today].checkInTimestamp = timestamp;
            records[today].method = 'QR Code';
            records[today].status = 'Present';
        } else if (records[today].checkInTime && !records[today].checkOutTime) {
            records[today].method = 'QR Code';
        } else if (records[today].checkInTime && records[today].checkOutTime) {
            return { success: false, message: 'Attendance already recorded for today' };
        }

        history.push({
            type: 'qr-attendance',
            timestamp,
            time,
            date: today,
            code: qrCode
        });

        saveAttendanceRecords(records, userEmail);
        saveAttendanceHistory(history, userEmail);
        updateUI();

        return { success: true, message: `QR attendance recorded at ${formatTimeDisplay(time)}` };
    }

    // ============================================
    // 4. DATA RETRIEVAL
    // ============================================

    function getTodayAttendance(userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        const today = getToday();
        const records = getAttendanceRecords(userEmail);
        return records[today] || null;
    }

    function getTodayHistory(userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        const today = getToday();
        const history = getAttendanceHistory(userEmail);
        return history.filter(h => h.date === today);
    }

    function getMonthlyAttendance(userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        const records = getAttendanceRecords(userEmail);
        const today = new Date();
        const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');

        let daysPresent = 0;
        Object.keys(records).forEach(date => {
            if (date.startsWith(currentMonth) && records[date].status === 'Present') {
                daysPresent++;
            }
        });

        const workingDays = 22;
        const percentage = Math.round((daysPresent / workingDays) * 100);

        return { daysPresent, workingDays, percentage };
    }

    function getAttendanceByDateRange(startDate, endDate, userEmail) {
        if (!userEmail) userEmail = getCurrentUser();
        const records = getAttendanceRecords(userEmail);
        const filtered = {};

        Object.keys(records).forEach(date => {
            if (date >= startDate && date <= endDate) {
                filtered[date] = records[date];
            }
        });

        return filtered;
    }

    // ============================================
    // 5. ADMIN FUNCTIONS
    // ============================================

    function getAttendanceByDepartmentAndLevel(department, level, date) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        const matchingUsers = users.filter(u => 
            u.department === department && u.level === level && u.active !== false
        );

        const result = matchingUsers.map(user => {
            const userRecords = getAttendanceRecords(user.email);
            const userRecord = userRecords[date] || {};
            return {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                checkInTime: userRecord.checkInTime ? formatTimeDisplay(userRecord.checkInTime) : '—',
                checkOutTime: userRecord.checkOutTime ? formatTimeDisplay(userRecord.checkOutTime) : '—',
                method: userRecord.method || '—',
                workHours: userRecord.workHours || '—',
                status: userRecord.status || 'Absent'
            };
        });

        return result;
    }

    // ============================================
    // 6. UI MANAGEMENT
    // ============================================

    function updateUI() {
        updateDashboardUI();
        updateAttendancePageUI();
    }

    function updateDashboardUI() {
        const userEmail = getCurrentUser();
        const today = getToday();
        
        // FORCE FRESH READ FROM LOCALSTORAGE - no caching
        const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const userRecords = allRecords[userEmail] || {};
        let todayRec = userRecords[today];

        // Handle both array and object formats
        let latestSession = null;
        if (Array.isArray(todayRec)) {
            latestSession = todayRec[todayRec.length - 1] || null;
        } else if (typeof todayRec === 'object' && todayRec && todayRec.checkInTime) {
            latestSession = todayRec;
        }

        const todayStatusEl = document.getElementById('todayStatus');
        if (todayStatusEl) {
            todayStatusEl.textContent = '';  // CLEAR FIRST
            if (latestSession && latestSession.checkOutTime) {
                // If checked out, show checkout status
                todayStatusEl.textContent = `Checked Out ${formatTimeDisplay(latestSession.checkOutTime)}`;
            } else if (latestSession && latestSession.checkInTime) {
                // If only checked in, show check-in status
                todayStatusEl.textContent = `Checked In ${formatTimeDisplay(latestSession.checkInTime)}`;
            } else {
                todayStatusEl.textContent = '—';
            }
        }

        const workHoursEl = document.getElementById('workHours');
        if (workHoursEl) {
            workHoursEl.textContent = '';  // CLEAR FIRST
            let totalSeconds = 0;
            if (Array.isArray(todayRec)) {
                todayRec.forEach(session => {
                    if (session.workHours) totalSeconds += session.workHours;
                });
            } else if (typeof todayRec === 'object' && todayRec && todayRec.workHours) {
                totalSeconds = todayRec.workHours;
            }
            workHoursEl.textContent = totalSeconds > 0 ? formatWorkDuration(totalSeconds) : '—';
        }

        const monthlyEl = document.getElementById('monthlyAttendance');
        if (monthlyEl) {
            monthlyEl.textContent = '';  // CLEAR FIRST
            const monthly = getMonthlyAttendance(userEmail);
            monthlyEl.textContent = `${monthly.percentage}%`;
        }

        const historyEl = document.getElementById('attendanceHistory');
        if (historyEl) {
            const entries = Object.entries(userRecords).sort((a, b) => b[0].localeCompare(a[0]));
            historyEl.innerHTML = '';  // CLEAR FIRST
            historyEl.innerHTML = entries.slice(0, 14).map(([date, rec]) => {
                let checkIn = '—', checkOut = '—', hours = '—', method = 'Manual';
                // Handle both array and object formats
                if (Array.isArray(rec) && rec.length > 0) {
                    const latest = rec[rec.length - 1];
                    checkIn = latest.checkInTime ? formatTimeDisplay(latest.checkInTime) : '—';
                    checkOut = latest.checkOutTime ? formatTimeDisplay(latest.checkOutTime) : '—';
                    method = latest.method || 'Manual';
                    let totalSeconds = 0;
                    rec.forEach(session => {
                        if (session.workHours) totalSeconds += session.workHours;
                    });
                    hours = totalSeconds > 0 ? formatWorkDuration(totalSeconds) : '—';
                } else if (typeof rec === 'object' && rec && rec.checkInTime) {
                    checkIn = rec.checkInTime ? formatTimeDisplay(rec.checkInTime) : '—';
                    checkOut = rec.checkOutTime ? formatTimeDisplay(rec.checkOutTime) : '—';
                    hours = rec.workHours ? formatWorkDuration(rec.workHours) : '—';
                    method = rec.method || 'Manual';
                }
                return `
                    <div class="activity-item">
                        <div class="activity-content">
                            <div class="activity-title">${date}</div>
                            <div class="activity-time">In: ${checkIn} | Out: ${checkOut} | ${hours} | ${method}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    function updateAttendancePageUI() {
        const userEmail = getCurrentUser();
        const today = getToday();
        
        // FORCE FRESH READ FROM LOCALSTORAGE - no caching
        const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const userRecords = allRecords[userEmail] || {};
        let todayRec = userRecords[today];

        // Handle both array and object formats
        let latestSession = null;
        if (Array.isArray(todayRec)) {
            latestSession = todayRec[todayRec.length - 1] || null;
        } else if (typeof todayRec === 'object' && todayRec && todayRec.checkInTime) {
            latestSession = todayRec;
        }

        // Update Check-In Time
        const checkInEl = document.getElementById('todayCheckIn');
        if (checkInEl) {
            const checkInValue = latestSession && latestSession.checkInTime ? formatTimeDisplay(latestSession.checkInTime) : '—';
            checkInEl.textContent = '';  // CLEAR FIRST
            checkInEl.textContent = checkInValue;
        }

        // Update Check-Out Time (CRITICAL FIX - FORCE HARD REFRESH)
        const checkOutEl = document.getElementById('todayCheckOut');
        if (checkOutEl) {
            const checkOutValue = latestSession && latestSession.checkOutTime ? formatTimeDisplay(latestSession.checkOutTime) : '—';
            checkOutEl.textContent = '';  // CLEAR FIRST TO FORCE DOM UPDATE
            checkOutEl.textContent = checkOutValue;
        }

        // Update Attendance Method
        const methodEl = document.getElementById('todayMethod');
        if (methodEl) {
            const methodValue = latestSession && latestSession.method ? latestSession.method : '—';
            methodEl.textContent = '';  // CLEAR FIRST
            methodEl.textContent = methodValue;
        }

        // Update Work Hours (auto-calculated when checkout time is set) - Show total for all sessions
        const workHoursEl = document.getElementById('todayWorkHours');
        if (workHoursEl) {
            let totalSeconds = 0;
            if (Array.isArray(todayRec)) {
                todayRec.forEach(session => {
                    if (session.workHours) totalSeconds += session.workHours;
                });
            } else if (typeof todayRec === 'object' && todayRec && todayRec.workHours) {
                totalSeconds = todayRec.workHours;
            }
            const workHoursValue = totalSeconds > 0 ? formatWorkDuration(totalSeconds) : '—';
            workHoursEl.textContent = '';  // CLEAR FIRST
            workHoursEl.textContent = workHoursValue;
        }

        updateTodayHistory();
    }

    function updateTodayHistory() {
        const userEmail = getCurrentUser();
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        const todayHistory = getTodayHistory(userEmail);
        if (todayHistory.length === 0) {
            historyList.innerHTML = '<p style="color:var(--text-secondary);">No events recorded today</p>';
            return;
        }

        const html = todayHistory.map(event => {
            let icon = '📋';
            let label = event.type;
            
            if (event.type === 'login') icon = '🔓';
            else if (event.type === 'logout') icon = '🔒';
            else if (event.type === 'check-in') icon = '✅';
            else if (event.type === 'check-out') icon = '⏹️';
            else if (event.type === 'qr-attendance') icon = '📱';

            return `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-title">${icon} ${label.toUpperCase().replace(/-/g, ' ')}</div>
                        <div class="activity-time">${event.time}</div>
                        ${event.method ? `<div style="color:var(--text-secondary);font-size:0.85rem;">Method: ${event.method}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        historyList.innerHTML = html;
    }

    // ============================================
    // 7. PUBLIC API
    // ============================================

    window.AttendanceManager = {
        recordLogin,
        recordLogout,
        manualCheckIn,
        manualCheckOut,
        recordQRAttendance,
        getTodayAttendance,
        getTodayHistory,
        getMonthlyAttendance,
        getAttendanceByDateRange,
        getAttendanceByDepartmentAndLevel,
        getAttendanceRecords,
        getAttendanceHistory,
        getToday,
        formatTimeDisplay,
        updateUI,
        getCurrentUser
    });
})();

