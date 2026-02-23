// Checkout Handler - Standalone Logic (SAME PATTERN AS CHECK-IN)
(function() {
    'use strict';

    // Get current time in 24-hour format (HH:MM:SS)
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

    // Calculate work hours between check-in and check-out
    function calculateWorkHours(checkInTime, checkOutTime) {
        try {
            const parseTime = (timeStr) => {
                const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10) || 0);
                return h * 3600 + m * 60 + s;
            };

            let inSec = parseTime(checkInTime);
            let outSec = parseTime(checkOutTime);

            // Handle overnight checkout
            if (outSec < inSec) {
                outSec += 24 * 3600;
            }

            const diffSeconds = Math.max(0, outSec - inSec);
            const hours = diffSeconds / 3600;
            return Math.round(hours * 100) / 100;
        } catch (e) {
            console.error('Work hours calculation error:', e);
            return 0;
        }
    }

    // Themed toast notification (uses CSS .toast and .toast-container)
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

    // Get current user email
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

    // Update UI after checkout
    function updateCheckoutUI() {
        const userEmail = getCurrentUserEmail();
        if (!userEmail) return;

        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        const userRecords = allRecords[userEmail] || {};
        const today = new Date().toISOString().split('T')[0];
        const todayRec = userRecords[today];

        console.log('📊 Updating checkout UI with:', todayRec);

        // UPDATE DASHBOARD ELEMENTS (primary location for checkout button)
        const todayStatusEl = document.getElementById('todayStatus');
        if (todayStatusEl && todayRec && todayRec.checkOutTime) {
            const displayTime = formatTimeDisplay(todayRec.checkOutTime);
            todayStatusEl.innerHTML = '';
            todayStatusEl.textContent = '';
            while (todayStatusEl.firstChild) {
                todayStatusEl.removeChild(todayStatusEl.firstChild);
            }
            todayStatusEl.textContent = `Checked Out ${displayTime}`;
            todayStatusEl.innerHTML = `Checked Out ${displayTime}`;
            console.log('✅ Dashboard todayStatus updated:', `Checked Out ${displayTime}`);
        }

        const workHoursEl = document.getElementById('workHours');
        if (workHoursEl && todayRec && todayRec.workHours) {
            const hoursText = todayRec.workHours + 'h';
            workHoursEl.innerHTML = '';
            workHoursEl.textContent = '';
            while (workHoursEl.firstChild) {
                workHoursEl.removeChild(workHoursEl.firstChild);
            }
            workHoursEl.textContent = hoursText;
            workHoursEl.innerHTML = hoursText;
            console.log('✅ Dashboard workHours updated:', hoursText);
        }

        // ALSO UPDATE ATTENDANCE PAGE ELEMENTS (for when user navigates to attendance page)
        const checkOutAttEl = document.getElementById('todayCheckOut');
        const workHoursAttEl = document.getElementById('todayWorkHours');
        
        if (checkOutAttEl && todayRec && todayRec.checkOutTime) {
            const displayTime = formatTimeDisplay(todayRec.checkOutTime);
            checkOutAttEl.innerHTML = '';
            checkOutAttEl.textContent = '';
            while (checkOutAttEl.firstChild) {
                checkOutAttEl.removeChild(checkOutAttEl.firstChild);
            }
            checkOutAttEl.textContent = displayTime;
            checkOutAttEl.innerHTML = displayTime;
            console.log('✅ Attendance Page todayCheckOut updated:', displayTime);
        }

        if (workHoursAttEl && todayRec && todayRec.workHours) {
            const hoursText = todayRec.workHours + 'h';
            workHoursAttEl.innerHTML = '';
            workHoursAttEl.textContent = '';
            while (workHoursAttEl.firstChild) {
                workHoursAttEl.removeChild(workHoursAttEl.firstChild);
            }
            workHoursAttEl.textContent = hoursText;
            workHoursAttEl.innerHTML = hoursText;
            console.log('✅ Attendance Page workHours updated:', hoursText);
        }

        // Update attendance times if element exists
        const attendanceTimes = document.getElementById('attendanceTimes');
        if (attendanceTimes && todayRec) {
            const checkIn = todayRec.checkInTime ? formatTimeDisplay(todayRec.checkInTime) : '—';
            const checkOut = todayRec.checkOutTime ? formatTimeDisplay(todayRec.checkOutTime) : '—';
            const displayText = `Checked In: ${checkIn}<br>Checked Out: ${checkOut}`;
            attendanceTimes.innerHTML = displayText;
            console.log('✅ Dashboard attendance times updated');
        }
    }

    // CHECKOUT LOGIC - SAME PATTERN AS CHECK-IN
    function handleCheckOut() {
        console.log('🔴 CHECKOUT TRIGGERED - Processing...');

        // Step 1: Validate user is logged in
        const userEmail = getCurrentUserEmail();
        if (!userEmail) {
            showToast('User not logged in', 'error');
            console.error('❌ No user email found');
            return;
        }
        console.log('✅ User found:', userEmail);

        // Step 2: Get today's date and current time
        const today = new Date().toISOString().split('T')[0];
        const currentTime = getCurrentTime();
        console.log('📅 Today:', today, '⏰ Current time:', currentTime);

        // Step 3: Get existing records from correct storage
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        if (!allRecords[userEmail]) {
            allRecords[userEmail] = {};
        }
        const userTodayRec = allRecords[userEmail][today];
        console.log('📋 Current record:', userTodayRec);

        // Step 4: Validate check-in exists
        if (!userTodayRec || !userTodayRec.checkInTime) {
            showToast('Please check in first', 'error');
            console.warn('⚠️ No check-in found for today');
            return;
        }
        console.log('✅ Check-in confirmed:', userTodayRec.checkInTime);

        // Step 5: Validate not already checked out
        if (userTodayRec.checkOutTime) {
            showToast('Already checked out today', 'error');
            console.warn('⚠️ Already checked out at:', userTodayRec.checkOutTime);
            return;
        }
        console.log('✅ No previous checkout found');

        // Step 6: Calculate work hours
        const workHours = calculateWorkHours(userTodayRec.checkInTime, currentTime);
        console.log('⏱️ Work hours calculated:', workHours);

        // Step 7: Save checkout to storage
        allRecords[userEmail][today].checkOutTime = currentTime;
        allRecords[userEmail][today].checkOutTimestamp = Date.now();
        allRecords[userEmail][today].workHours = workHours;
        localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
        localStorage.setItem('userEmail', userEmail);
        console.log('💾 Checkout saved to storage:', allRecords[userEmail][today]);

        // IMMEDIATE UPDATE - Update DASHBOARD elements (where checkout button is)
        const todayStatusEl = document.getElementById('todayStatus');
        const workHoursEl = document.getElementById('workHours');
        const displayTime = formatTimeDisplay(currentTime);
        
        if (todayStatusEl) {
            todayStatusEl.innerHTML = '';
            todayStatusEl.textContent = '';
            while (todayStatusEl.firstChild) {
                todayStatusEl.removeChild(todayStatusEl.firstChild);
            }
            todayStatusEl.textContent = `Checked Out ${displayTime}`;
            todayStatusEl.innerHTML = `Checked Out ${displayTime}`;
            console.log('⚡ IMMEDIATE DOM UPDATE - Todo Status:', `Checked Out ${displayTime}`);
        }
        
        if (workHoursEl) {
            workHoursEl.innerHTML = '';
            workHoursEl.textContent = '';
            while (workHoursEl.firstChild) {
                workHoursEl.removeChild(workHoursEl.firstChild);
            }
            workHoursEl.textContent = workHours + 'h';
            workHoursEl.innerHTML = workHours + 'h';
            console.log('⚡ IMMEDIATE DOM UPDATE - Work Hours:', workHours + 'h');
        }
        
        // Show success notification
        const message = `Successfully Checked Out at ${displayTime}. Work hours: ${workHours}h`;
        showToast(message, 'success');
        console.log('🎉 Toast shown:', message);

        // Step 9: ULTRA-AGGRESSIVE UI refresh - Multiple cycles
        for (let cycle = 0; cycle < 3; cycle++) {
            setTimeout(() => {
                console.log(`🔄 UI Refresh Cycle ${cycle + 1}...`);
                
                // Force fresh read from localStorage
                const freshRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
                const freshUserRec = freshRecords[userEmail] || {};
                const freshTodayRec = freshUserRec[today];
                
                console.log('🔍 Fresh record from storage:', freshTodayRec);
                
                // UPDATE DASHBOARD ELEMENTS (primary - where checkout button is)
                const todayStatusEl = document.getElementById('todayStatus');
                if (todayStatusEl && freshTodayRec && freshTodayRec.checkOutTime) {
                    const freshDisplayTime = formatTimeDisplay(freshTodayRec.checkOutTime);
                    todayStatusEl.innerHTML = '';
                    todayStatusEl.textContent = '';
                    while (todayStatusEl.firstChild) {
                        todayStatusEl.removeChild(todayStatusEl.firstChild);
                    }
                    todayStatusEl.innerHTML = `Checked Out ${freshDisplayTime}`;
                    todayStatusEl.textContent = `Checked Out ${freshDisplayTime}`;
                    console.log(`✅ Cycle ${cycle + 1} - DASHBOARD STATUS SET:`, `Checked Out ${freshDisplayTime}`);
                }
                
                const dashWorkHoursEl = document.getElementById('workHours');
                if (dashWorkHoursEl && freshTodayRec && freshTodayRec.workHours) {
                    const hoursText = freshTodayRec.workHours + 'h';
                    dashWorkHoursEl.innerHTML = '';
                    dashWorkHoursEl.textContent = '';
                    while (dashWorkHoursEl.firstChild) {
                        dashWorkHoursEl.removeChild(dashWorkHoursEl.firstChild);
                    }
                    dashWorkHoursEl.innerHTML = hoursText;
                    dashWorkHoursEl.textContent = hoursText;
                    console.log(`✅ Cycle ${cycle + 1} - DASHBOARD WORK HOURS SET:`, hoursText);
                }
                
                // UPDATE ATTENDANCE PAGE ELEMENTS (for when user navigates there)
                const checkOutEl = document.getElementById('todayCheckOut');
                if (checkOutEl && freshTodayRec && freshTodayRec.checkOutTime) {
                    const freshDisplayTime = formatTimeDisplay(freshTodayRec.checkOutTime);
                    checkOutEl.innerHTML = '';
                    checkOutEl.textContent = '';
                    while (checkOutEl.firstChild) {
                        checkOutEl.removeChild(checkOutEl.firstChild);
                    }
                    checkOutEl.innerHTML = freshDisplayTime;
                    checkOutEl.textContent = freshDisplayTime;
                    console.log(`✅ Cycle ${cycle + 1} - ATTENDANCE CHECK-OUT TIME SET:`, freshDisplayTime);
                }
                
                const attWorkHoursEl = document.getElementById('todayWorkHours');
                if (attWorkHoursEl && freshTodayRec && freshTodayRec.workHours) {
                    const hoursText = freshTodayRec.workHours + 'h';
                    attWorkHoursEl.innerHTML = '';
                    attWorkHoursEl.textContent = '';
                    while (attWorkHoursEl.firstChild) {
                        attWorkHoursEl.removeChild(attWorkHoursEl.firstChild);
                    }
                    attWorkHoursEl.innerHTML = hoursText;
                    attWorkHoursEl.textContent = hoursText;
                    console.log(`✅ Cycle ${cycle + 1} - ATTENDANCE WORK HOURS SET:`, hoursText);
                }
                
                // Also trigger AttendanceManager update if available
                if (window.AttendanceManager && typeof window.AttendanceManager.updateUI === 'function') {
                    window.AttendanceManager.updateUI();
                    console.log(`✅ Cycle ${cycle + 1} - AttendanceManager.updateUI() called`);
                }
            }, 100 + (cycle * 300));
        }
        
        // FINAL safeguard at 2 seconds
        setTimeout(() => {
            console.log('🔴 FINAL SAFEGUARD - Force update dashboard and attendance elements');
            const freshRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
            const freshUserRec = freshRecords[userEmail] || {};
            const freshTodayRec = freshUserRec[today];
            
            if (freshTodayRec && freshTodayRec.checkOutTime) {
                const finalTime = formatTimeDisplay(freshTodayRec.checkOutTime);
                
                // Update dashboard
                const todayStatusEl = document.getElementById('todayStatus');
                if (todayStatusEl) {
                    todayStatusEl.innerHTML = `Checked Out ${finalTime}`;
                    todayStatusEl.textContent = `Checked Out ${finalTime}`;
                    console.log('✅ FINAL - Dashboard status locked in:', `Checked Out ${finalTime}`);
                }
                
                // Update attendance page
                const checkOutEl = document.getElementById('todayCheckOut');
                if (checkOutEl) {
                    checkOutEl.innerHTML = finalTime;
                    checkOutEl.textContent = finalTime;
                    console.log('✅ FINAL - Attendance checkout time locked in:', finalTime);
                }
            }
            
            if (freshTodayRec && freshTodayRec.workHours) {
                const finalHours = freshTodayRec.workHours + 'h';
                
                // Update dashboard
                const workHoursEl = document.getElementById('workHours');
                if (workHoursEl) {
                    workHoursEl.innerHTML = finalHours;
                    workHoursEl.textContent = finalHours;
                    console.log('✅ FINAL - Dashboard work hours locked in:', finalHours);
                }
                
                // Update attendance page
                const attWorkHoursEl = document.getElementById('todayWorkHours');
                if (attWorkHoursEl) {
                    attWorkHoursEl.innerHTML = finalHours;
                    attWorkHoursEl.textContent = finalHours;
                    console.log('✅ FINAL - Attendance work hours locked in:', finalHours);
                }
            }
        }, 2000);
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Checkout Handler initializing...');
        
        const checkOutBtn = document.getElementById('checkOutBtn');
        if (checkOutBtn) {
            // Clone button to remove all old listeners
            const newBtn = checkOutBtn.cloneNode(true);
            checkOutBtn.parentNode.replaceChild(newBtn, checkOutBtn);
            
            // Attach fresh listener to cloned button
            newBtn.addEventListener('click', handleCheckOut);
            console.log('✅ Fresh Check-Out button listener attached (old listeners removed)');
        } else {
            console.warn('⚠️ Check-Out button not found in DOM');
        }
    });

    // Expose functions globally for debugging
    window.CheckoutHandler = {
        handleCheckOut,
        updateCheckoutUI,
        getCurrentUserEmail,
        formatTimeDisplay,
        calculateWorkHours
    };
})();
