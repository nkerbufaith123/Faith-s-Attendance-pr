// qr-attendance.js — QR code generation and verification logic
// Logic only; no HTML/CSS changes

(() => {
    'use strict';

    const QR_STORAGE_KEY = 'qrSessions';
    const QR_TTL_MS = 5 * 60 * 1000; // 5 minutes validity
    const QR_ID_LENGTH = 10;
    const QR_LIB_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

    // Secure random ID generator ensuring mix of classes
    function secureRandomId(len = QR_ID_LENGTH) {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        const all = upper + lower + digits + symbols;

        const cryptoObj = window.crypto || window.msCrypto;
        function meetsRequirements(s) {
            return /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s) && /[^A-Za-z0-9]/.test(s) && s.length===len;
        }

        if (!cryptoObj || !cryptoObj.getRandomValues) {
            // fallback to Math.random but ensure requirements
            let id = '';
            let attempts = 0;
            while ((!id || !meetsRequirements(id)) && attempts < 500) {
                id = Array.from({length: len}, ()=> all[Math.floor(Math.random()*all.length)]).join('');
                attempts++;
            }
            return id;
        }

        const bytes = new Uint8Array(len);
        let id = '';
        let attempts = 0;
        while (attempts < 500) {
            cryptoObj.getRandomValues(bytes);
            id = Array.from(bytes).map(b => all[b % all.length]).join('').slice(0,len);
            if (meetsRequirements(id)) return id;
            attempts++;
        }
        return id;
    }

    function readQrStorage() {
        try {
            const raw = localStorage.getItem(QR_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return Object.values(parsed);
            return [];
        } catch(e){ return []; }
    }
    function writeQrStorage(arr) { localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(Array.isArray(arr) ? arr : (arr?Object.values(arr):[]))); }

    function saveQrSession(session) {
        const arr = readQrStorage();
        arr.push(session);
        writeQrStorage(arr);
    }

    function isUniqueId(id) {
        const arr = readQrStorage();
        return !arr.some(s => (s && (s.session_id === id || s.qr_id === id)));
    }

    function generateUniqueId() {
        let id;
        let attempts = 0;
        do {
            id = secureRandomId(QR_ID_LENGTH);
            attempts++;
            if (attempts > 500) throw new Error('Unable to generate unique QR ID');
        } while (!isUniqueId(id));
        return id;
    }

    function markSessionUsed(sessionId) {
        const arr = readQrStorage();
        const idx = arr.findIndex(s => s.session_id === sessionId || s.qr_id === sessionId);
        if (idx >= 0) {
            arr[idx].used = true;
            arr[idx].usedAt = new Date().toISOString();
            arr[idx].status = 'USED';
            writeQrStorage(arr);
        }
    }

    function getSession(sessionId) {
        const arr = readQrStorage();
        return arr.find(s => s.session_id === sessionId || s.qr_id === sessionId) || null;
    }

    function isExpired(session) {
        if (!session) return true;
        if (session.expiration_time) {
            return Date.now() > new Date(session.expiration_time).getTime();
        }
        if (session.createdAt) {
            const created = new Date(session.createdAt).getTime();
            return (Date.now() - created) > QR_TTL_MS;
        }
        return true;
    }

    // Load QR lib if not present
    function ensureQrLib(cb) {
        if (window.QRCode) return cb();
        const s = document.createElement('script'); s.src = QR_LIB_CDN; s.async = true;
        s.onload = () => cb(); s.onerror = () => cb(new Error('Failed to load QR lib'));
        document.head.appendChild(s);
    }

    // Create modal dynamically using existing modal CSS classes
    function createOrGetModal() {
        let modal = document.getElementById('qrModalGenerated');
        if (modal) return modal;
        modal = document.createElement('div'); modal.id = 'qrModalGenerated'; modal.className = 'modal';
        modal.style.zIndex = 2000;
        const content = document.createElement('div'); content.className = 'modal-content';
        content.style.maxWidth = '420px';
        content.innerHTML = `
            <div class="modal-header">
                <h2>Generated QR Code</h2>
                <button class="modal-close" id="qrModalClose">&times;</button>
            </div>
            <div class="modal-body" style="text-align:center">
                <div id="qrCanvas" style="display:flex; align-items:center; justify-content:center; padding:1rem;"></div>
                <div style="margin-top:0.75rem; display:flex; gap:0.5rem; align-items:center; justify-content:center;">
                    <input id="qrIdInputGenerated" readonly style="background:transparent; border:none; color:var(--text-main); font-weight:700; text-align:center; width:100%;" />
                    <button id="qrCopyBtn" class="btn-secondary" style="white-space:nowrap;">Copy</button>
                </div>
                <div id="qrInfo" style="margin-top:0.5rem; color:var(--text-secondary); font-size:0.9rem;"></div>
            </div>
        `;
        modal.appendChild(content);
        document.body.appendChild(modal);

        // close handlers
        modal.addEventListener('click', (e)=>{ if (e.target === modal) modal.classList.remove('active'); });
        content.querySelector('#qrModalClose').addEventListener('click', ()=> modal.classList.remove('active'));
        return modal;
    }

    function showModal(modal) { modal.classList.add('active'); }

    function renderQrCode(sessionId) {
        ensureQrLib((err)=>{
            const modal = createOrGetModal();
            const canvas = modal.querySelector('#qrCanvas');
            canvas.innerHTML = '';
            try {
                new QRCode(canvas, { text: sessionId, width: 180, height: 180 });
            } catch(e) {
                // some QR libs throw; fallback
                const img = document.createElement('img'); img.alt = sessionId; img.src = '';
                canvas.appendChild(img);
            }
            const idInput = modal.querySelector('#qrIdInputGenerated');
            idInput.value = sessionId;
            const info = modal.querySelector('#qrInfo');
            const session = getSession(sessionId) || {};
            const exp = session.expiration_time ? new Date(session.expiration_time) : new Date(Date.now()+QR_TTL_MS);
            const mins = Math.max(0, Math.round((exp.getTime() - Date.now())/60000));
            info.textContent = `Expires in ${mins} minutes`;

            const copyBtn = modal.querySelector('#qrCopyBtn');
            copyBtn.onclick = function() {
                try {
                    navigator.clipboard.writeText(sessionId).then(()=>{
                        if (window.showToast) window.showToast('QR Code ID Copied', 'success');
                    }).catch(()=>{
                        idInput.select(); document.execCommand('copy'); if (window.showToast) window.showToast('QR Code ID Copied', 'success');
                    });
                } catch(e) { console.error('Copy failed', e); if (window.showToast) window.showToast('Copy failed', 'error'); }
            };

            showModal(modal);
        });
    }

    function generateAndShowQr() {
        const id = generateUniqueId();
        const createdAt = new Date();
        const expiration_time = new Date(createdAt.getTime() + QR_TTL_MS).toISOString();
        const session = { session_id: id, qr_id: id, createdAt: createdAt.toISOString(), expiration_time, used: false, status: 'ACTIVE' };
        saveQrSession(session);
        renderQrCode(id);
    }

    // Verification logic used on Attendance verify screen
    function verifyQrInput(raw) {
        const sessionId = (raw||'').trim();
        if (!sessionId) return { success:false, error:'Invalid QR Code' };
        const session = getSession(sessionId);
        if (!session) return { success:false, error:'Invalid QR Code' };
        if (isExpired(session)) return { success:false, error:'QR Code Expired — Generate a New Code' };
        if (session.used || session.status === 'USED') return { success:false, error:'QR Code Already Used' };
        return { success:true, session };
    }

    function qrCheckInFlow(sessionId) {
        // Record attendance: same storage key as attendance.js (attendanceData)
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const timeStored = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`; // stored as HH:MM:SS

        const att = JSON.parse(localStorage.getItem('attendanceData') || '{}');
        att[today] = att[today] || {};
        // If already checked in, ignore
        if (att[today].checkIn && !att[today].checkOut) {
            if (window.showToast) window.showToast(`Already Checked In at ${window.formatTimeStr ? window.formatTimeStr(att[today].checkIn) : att[today].checkIn}`, 'warning');
            return { success:false, message:'Already checked in' };
        }
        att[today].checkIn = timeStored;
        att[today].method = 'QR Code';
        att[today].qrSessionId = sessionId;
        att[today].checkInTimestamp = new Date().toISOString();
        localStorage.setItem('attendanceData', JSON.stringify(att));

        // update UI using existing functions if present
        if (typeof renderAttendanceToday === 'function') renderAttendanceToday();
        if (typeof showAttendanceData === 'function') showAttendanceData();
        if (typeof AttendanceModule !== 'undefined' && AttendanceModule && typeof AttendanceModule.updateHistoryUI === 'function') {
            try { AttendanceModule.updateHistoryUI(); } catch(e){}
        }
        // show toast
        if (window.showToast) window.showToast('Attendance Successfully Taken', 'success');
        return { success:true };
    }

    // Hook generate button and verify button
    function attachListeners() {
        const genBtn = document.getElementById('generateQrBtn');
        if (genBtn) genBtn.addEventListener('click', (e)=>{ e.preventDefault(); generateAndShowQr(); });

        const verifyBtn = document.getElementById('verifyQrCodeBtn');
        const verifyInput = document.getElementById('qrVerifyInput');
        if (verifyBtn && verifyInput) {
            verifyBtn.addEventListener('click', (e)=>{
                e.preventDefault();
                const raw = verifyInput.value || '';
                const result = verifyQrInput(raw);
                if (!result.success) {
                    if (window.showToast) window.showToast(result.error, 'error');
                    return;
                }
                // successful
                qrCheckInFlow(result.session.session_id);
            });
        }
    }

    // Expose API for other scripts
    window.QRAttendance = {
        generateUniqueId,
        verifyQrInput,
        getSession,
        markSessionUsed
    };

    // init
    function init() {
        attachListeners();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
