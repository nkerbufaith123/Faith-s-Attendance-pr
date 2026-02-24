// Simplified Checkout Handler - FIXED VERSION
(function() {
    'use strict';

    console.log('🚀 Checkout Handler Initializing...');

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
            return diffSeconds; // Return seconds for accurate HH:MM:SS conversion
        } catch (e) {
            console.error('Work hours calculation error:', e);
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

    function showToast(message, type = 'success') {
        const container = document.querySelector('.toast-container') || (function(){
            const c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
            return c;
        })();
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

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    // MAIN CHECKOUT FUNCTION
    function performCheckOut() {
        console.log('🔴 CHECKOUT INITIATED...');

        // Validate user
        const userEmail = getCurrentUserEmail();
        if (!userEmail) {
            showToast('User not logged in', 'error');
            console.error('❌ No user email');
            return;
        }
        console.log('✅ User:', userEmail);

        const today = getToday();
        const currentTime = getCurrentTime();
        console.log('📅 Date:', today, '⏰ Time:', currentTime);

        // Get existing records
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        if (!allRecords[userEmail]) {
            allRecords[userEmail] = {};
        }

        if (!allRecords[userEmail][today]) {
            showToast('Please check in first', 'error');
            console.warn('⚠️ No check-in found');
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
        console.log('📋 Current sessions:', todaySessions);

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
            console.warn('⚠️ No active check-in session');
            return;
        }

        // Update the active session (and ONLY that session)
        const activeSession = todaySessions[activeSessionIndex];
        const workHours = calculateWorkHours(activeSession.checkInTime, currentTime);
        console.log('⏱️ Work Hours (seconds):', workHours, '| Formatted:', formatWorkDuration(workHours));

        // SAVE TO STORAGE
        activeSession.checkOutTime = currentTime;
        activeSession.checkOutTimestamp = Date.now();
        activeSession.workHours = workHours;
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        console.log('💾 Saved:', activeSession);

        // Calculate total work hours for all sessions today
        let totalHours = 0;
        todaySessions.forEach(session => {
            if (session.workHours) totalHours += session.workHours;
        });

        // DISPLAY UPDATES - Immediate
        const displayTime = formatTimeDisplay(currentTime);
        
        // Update dashboard elements
        const todayStatusEl = document.getElementById('todayStatus');
        const workHoursEl = document.getElementById('workHours');
        
        if (todayStatusEl) {
            todayStatusEl.textContent = `Checked Out ${displayTime}`;
            console.log('✅ Updated todayStatus:', `Checked Out ${displayTime}`);
        }
        
        if (workHoursEl) {
            workHoursEl.textContent = totalHours > 0 ? formatWorkDuration(totalHours) : '—';
            console.log('✅ Updated workHours:', formatWorkDuration(totalHours));
        }

        // Update attendance page elements if they exist
        const todayCheckOut = document.getElementById('todayCheckOut');
        const todayWorkHoursEl = document.getElementById('todayWorkHours');
        
        if (todayCheckOut) {
            todayCheckOut.textContent = displayTime;
            console.log('✅ Updated todayCheckOut:', displayTime);
        }
        
        if (todayWorkHoursEl) {
            todayWorkHoursEl.textContent = totalHours > 0 ? formatWorkDuration(totalHours) : '—';
            console.log('✅ Updated todayWorkHours:', formatWorkDuration(totalHours));
        }

        // Show toast
        showToast(`Checked Out at ${displayTime} - Session: ${formatWorkDuration(workHours)} | Daily Total: ${formatWorkDuration(totalHours)}`, 'success');

        // Call AttendanceManager if available
        if (window.AttendanceManager && typeof window.AttendanceManager.updateUI === 'function') {
            console.log('📊 Calling AttendanceManager.updateUI()');
            window.AttendanceManager.updateUI();
        }

        console.log('✅ CHECKOUT COMPLETE');
    }

    // NOTE: Button listener is now handled by attendance-buttons.js to prevent conflicts
    // This file provides the performCheckOut function as a fallback/utility
    // The checkout button will be wired up by attendance-buttons.js which loads first
    
    console.log('✅ Checkout Handler functions available via window.DebugCheckout');

    // Expose globally for debugging
    window.DebugCheckout = {
        performCheckOut,
        getCurrentTime,
        formatTimeDisplay,
        calculateWorkHours,
        getCurrentUserEmail,
        getToday
    };

    console.log('✅ Checkout Handler Ready - access via window.DebugCheckout');
})();
