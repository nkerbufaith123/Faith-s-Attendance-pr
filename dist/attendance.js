// attendance.js — Logic & data binding only
// Do not modify UI in this file.

// 1. Global time format setting (change to '24h' to use 24-hour format)
const TIME_FORMAT = '12h'; // or '24h'

// Global toast deduper: replace window.showToast with a wrapper that prevents duplicate
;(function setupGlobalToastDeduper(){
    try {
        const original = window.showToast && typeof window.showToast === 'function' ? window.showToast : null;
        let last = { key: null, ts: 0 };
        const THROTTLE_MS = 1800; // within 1.8s treat as duplicate

        function dedupeShowToast(message, type='success', key) {
            const k = key || message;
            const now = Date.now();
            if (last.key === k && (now - last.ts) < THROTTLE_MS) return; // skip duplicate
            last.key = k; last.ts = now;
            if (original) try { original(message, type); return; } catch (e) { /* fallthrough */ }
            // fallback visual toast if original isn't present
            const container = document.querySelector('.toast-container') || (function(){ const c = document.createElement('div'); c.className='toast-container'; c.style.position='fixed'; c.style.bottom='1.5rem'; c.style.right='1.5rem'; c.style.zIndex='9999'; document.body.appendChild(c); return c; })();
            const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = message; container.appendChild(t);
            setTimeout(()=>{ t.remove(); }, 3000);
        }

        // Override global
        window.showToast = dedupeShowToast;
    } catch (e) {
        console.warn('Toast deduper init failed', e);
    }
})();

const AttendanceModule = (function() {
    // Utilities
    function getTimeFormat() {
        return (typeof window.TIME_FORMAT_OVERRIDE !== 'undefined') ? window.TIME_FORMAT_OVERRIDE : TIME_FORMAT;
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function formatTime(date) {
        if (!(date instanceof Date)) date = new Date(date);
        const fmt = getTimeFormat();
        if (fmt === '24h') {
            return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        }
        // 12-hour English format with AM/PM
        // Use en-US locale to ensure English AM/PM rather than French
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    }

    function parseTimeStringToDate(timeStr) {
        // Accept 'HH:MM' or 'HH:MM:SS' (24-hour) and return a Date for today with that time
        if (!timeStr) return null;
        const parts = timeStr.split(':').map(p => parseInt(p, 10) || 0);
        const d = new Date();
        d.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
        return d;
    }

    function formatTimeStr(timeStr) {
        const d = parseTimeStringToDate(timeStr);
        if (!d) return '--';
        return formatTime(d);
    }

    // Duration formatter: returns {h,m,s} and string like '7h 48m 13s'
    function computeDuration(checkInStr, checkOutStr) {
        try {
            const toSec = (t) => {
                const p = (t||'').split(':').map(x => parseInt(x,10) || 0);
                while (p.length < 3) p.push(0);
                return p[0]*3600 + p[1]*60 + p[2];
            };
            let s1 = toSec(checkInStr);
            let s2 = toSec(checkOutStr);
            // handle crossing midnight
            if (s2 < s1) s2 += 24*3600;
            const diff = Math.max(0, s2 - s1);
            const h = Math.floor(diff/3600); const m = Math.floor((diff%3600)/60); const s = diff % 60;
            return { h, m, s, str: `${h}h ${m}m ${s}s` };
        } catch (e) {
            return { h:0, m:0, s:0, str:'0h 0m 0s' };
        }
    }

    // Storage manager
    const STORAGE_KEY = 'attendanceData';

    function readStorage() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }

    function writeStorage(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function saveCheckIn() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`; // store as 24H HH:MM:SS
        const data = readStorage();
        data[today] = data[today] || {};
        // Prevent duplicate check-in if already checked in and not checked out
        if (data[today].checkIn && !data[today].checkOut) return { success:false, message:'Already Checked In' };
        data[today].checkIn = time;
        data[today].method = 'Manual';
        writeStorage(data);
        updateAttendanceUI();
        updateHistoryUI();
        showAttendanceToast(`Successfully Checked In at ${formatTime(now)}`, 'success');
        return { success:true, time };
    }

    function saveCheckOut() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const data = readStorage();
        data[today] = data[today] || {};
        // Must have check-in first
        if (!data[today].checkIn) return { success:false, message:'Please Check In First' };
        if (data[today].checkOut) return { success:false, message:'Already Checked Out' };
        data[today].checkOut = time;
        data[today].method = data[today].method || 'Manual';
        // compute work hours and store
        const dur = computeDuration(data[today].checkIn, data[today].checkOut);
        data[today].workHours = dur.str;
        writeStorage(data);
        updateAttendanceUI();
        updateHistoryUI();
        showAttendanceToast(`Successfully Checked Out at ${formatTime(now)}`, 'success');
        return { success:true, time };
    }

    // Toast system (uses existing showToast if present; otherwise creates lightweight toasts)
    function showAttendanceToast(message, type='success') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        // fallback simple toast
        const container = document.querySelector('.toast-container') || createFallbackToastContainer();
        const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = message;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    function createFallbackToastContainer() {
        const c = document.createElement('div'); c.className = 'toast-container'; c.style.position='fixed'; c.style.bottom='1.5rem'; c.style.right='1.5rem'; c.style.zIndex='9999'; document.body.appendChild(c); return c;
    }

    // UI Updaters
    function updateAttendanceUI() {
        const data = readStorage();
        const today = new Date().toISOString().split('T')[0];
        const rec = data[today] || {};

        // Dashboard small attendance area (id: attendanceTimes)
        const attendanceTimes = document.getElementById('attendanceTimes');
        if (attendanceTimes) {
            if (rec.checkIn || rec.checkOut || rec.qrGeneratedAt) {
                const method = rec.method ? `Attendance method: ${rec.method}` : 'Attendance method: Manual';
                const checkIn = rec.checkIn ? `Checked In: ${formatTimeStr(rec.checkIn)}` : 'Checked In: --';
                const checkOut = rec.checkOut ? `Checked Out: ${formatTimeStr(rec.checkOut)}` : 'Checked Out: --';
                attendanceTimes.innerHTML = `${checkIn}<br>${checkOut}<br><small style="color:var(--text-secondary)">${method}</small>`;
            } else {
                attendanceTimes.textContent = 'No records for today';
            }
        }

        // Attendance page elements
        const tIn = document.getElementById('todayCheckIn');
        const tOut = document.getElementById('todayCheckOut');
        const tMethod = document.getElementById('todayMethod');
        const tWork = document.getElementById('todayWorkHours');
        if (tIn) tIn.textContent = rec.checkIn ? formatTimeStr(rec.checkIn) : '—';
        if (tOut) tOut.textContent = rec.checkOut ? formatTimeStr(rec.checkOut) : '—';
        if (tMethod) tMethod.textContent = rec.method || 'Manual';
        if (tWork) tWork.textContent = (rec.checkIn && rec.checkOut) ? computeDuration(rec.checkIn, rec.checkOut).str : '—';

        // Update main dashboard workHours stat if present
        const workHoursEl = document.getElementById('workHours');
        if (workHoursEl) {
            if (rec.checkIn && rec.checkOut) workHoursEl.textContent = computeDuration(rec.checkIn, rec.checkOut).str.replace(/\s/g, ' ');
            else workHoursEl.textContent = '0.0h';
        }
    }

    function updateHistoryUI() {
        const data = readStorage();
        // dashboard list id: attendanceHistory
        const historyEl = document.getElementById('attendanceHistory');
        if (historyEl) {
            const entries = Object.entries(data).sort((a,b)=>b[0].localeCompare(a[0]));
            historyEl.innerHTML = entries.slice(0,14).map(([date, d]) => {
                const method = d.method || 'Manual';
                const inTime = d.checkIn ? formatTimeStr(d.checkIn) : '--';
                const outTime = d.checkOut ? formatTimeStr(d.checkOut) : '--';
                const hours = (d.checkIn && d.checkOut) ? computeDuration(d.checkIn, d.checkOut).str : '--';
                return `<div class="activity-item"><div class="activity-content"><div class="activity-title">${date}</div><div class="activity-time">In: ${inTime} | Out: ${outTime} | Hours: ${hours}</div><div class="activity-time" style="margin-top:6px;color:var(--text-secondary)">${method}</div></div></div>`;
            }).join('');
        }
        // attendance.html history list id: historyList
        const historyList = document.getElementById('historyList');
        if (historyList) {
            const entries = Object.entries(data).sort((a,b)=>b[0].localeCompare(a[0]));
            const now = new Date();
            historyList.innerHTML = entries.map(([d, r]) => {
                const inTime = r.checkIn ? formatTimeStr(r.checkIn) : '--';
                const outTime = r.checkOut ? formatTimeStr(r.checkOut) : '--';
                const workHours = (r.checkIn && r.checkOut) ? computeDuration(r.checkIn, r.checkOut).str : '--';
                const method = r.method || 'Manual';
                return `<div class="activity-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;"><div class="activity-content" style="flex:1;"><div class="activity-title">${d}</div><div class="activity-time">In: ${inTime} | Out: ${outTime} | Hours: ${workHours}</div><div class="activity-time" style="margin-top:4px;"><span style="display:inline-block; background:${method==='QR Code'?'#22C55E30':'#3FA9FF30'}; border:1px solid ${method==='QR Code'?'#22C55E':'#3FA9FF'}; color:${method==='QR Code'?'#22C55E':'#3FA9FF'}; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${method}</span>${r.qrSessionId?`<span style="margin-left:8px; color:var(--text-secondary); font-size:0.85rem;">Session: ${r.qrSessionId}</span>`:''}</div></div></div>`;
            }).join('');
        }
    }

    // Attach listeners and expose public API
    function attachListeners() {
        // direct buttons
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');
        if (checkInBtn) checkInBtn.addEventListener('click', (e)=>{ e.preventDefault(); saveCheckIn(); });
        if (checkOutBtn) checkOutBtn.addEventListener('click', (e)=>{ e.preventDefault(); saveCheckOut(); });

        // delegated fallback for elements with data-action
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset && btn.dataset.action ? btn.dataset.action : btn.getAttribute('data-action');
            if (action === 'checkin') { e.preventDefault(); saveCheckIn(); }
            if (action === 'checkout') { e.preventDefault(); saveCheckOut(); }
        });
    }

    // Public API
    function init() {
        // expose global utilities for other scripts
        window.formatTime = formatTime;
        window.formatTimeStr = formatTimeStr;
        window.computeDuration = computeDuration;
        window.saveCheckIn = saveCheckIn;
        window.saveCheckOut = saveCheckOut;
        window.showAttendanceToast = showAttendanceToast;
        // backward compatibility: handlers expected by older files
        window.handleCheckIn = function() { return saveCheckIn(); };
        window.handleCheckOut = function() { return saveCheckOut(); };

        attachListeners();
        updateAttendanceUI();
        updateHistoryUI();
    }

    return { init, saveCheckIn, saveCheckOut, formatTime, formatTimeStr, computeDuration };
})();

// Auto-init when the script loads
if (typeof window !== 'undefined') {
    // Defer init until DOMContentLoaded if needed
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', AttendanceModule.init);
    else AttendanceModule.init();
}
