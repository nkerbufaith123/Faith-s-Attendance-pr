// Admin dashboard logic
(function(){
    function ensureAdmin() {
        try {
            const cur = JSON.parse(localStorage.getItem('currentUser')||'null');
            if (!cur || !cur.isAdmin) {
                window.location.href = 'login.html';
                return false;
            }
            return true;
        } catch(e){ window.location.href='login.html'; return false; }
    }

    function formatTimeStr(t){ if(!t) return '--'; return t; }

    function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }

    function getAttendanceMapForDate(dateIso){
        // flexible read: attendanceRecords or attendanceData
        const records = JSON.parse(localStorage.getItem('attendanceRecords')||'null');
        if (records && records[dateIso]) return records[dateIso];

        const attendanceData = JSON.parse(localStorage.getItem('attendanceData')||'{}');
        if (attendanceData && attendanceData[dateIso]) {
            const v = attendanceData[dateIso];
            // if value maps by email
            if (typeof v === 'object' && Object.keys(v).length && Object.values(v).some(x=>x && (x.checkIn || x.checkOut || x.method))) return v;
        }
        return {};
    }

    function updateMetrics(){
        const users = getUsers();
        const today = new Date().toISOString().slice(0,10);
        const map = getAttendanceMapForDate(today);
        let present = 0;
        users.forEach(u => { if (map[u.email] && map[u.email].checkIn) present++; });

        const total = users.length;
        const absent = Math.max(0, total - present);
        const rate = total? Math.round((present/total)*100):0;

        const elTotal = document.getElementById('totalUsers'); if (elTotal) elTotal.textContent = total;
        const elPresent = document.getElementById('usersPresent'); if (elPresent) elPresent.textContent = present;
        const elAbsent = document.getElementById('usersAbsent'); if (elAbsent) elAbsent.textContent = absent;
        const elRate = document.getElementById('attendanceRate'); if (elRate) elRate.textContent = rate + '%';
        // active QR sessions
        const sessions = JSON.parse(localStorage.getItem('qrSessions')||'[]');
        const elQr = document.getElementById('activeQrSessions'); if (elQr) elQr.textContent = (Array.isArray(sessions)?sessions.length:0);

        // recent activity: scan attendanceData keys
        const activityEl = document.getElementById('recentActivity');
        activityEl.innerHTML = '';
        const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '{}');
        const entries = Object.entries(attendanceData).slice().reverse().slice(0,20);
        entries.forEach(([date, data]) => {
            const el = document.createElement('div'); el.className='activity-item';
            if (data.checkIn || data.checkOut) {
                el.textContent = `${date} — ${data.checkIn||'--'} / ${data.checkOut||'--'}`;
            } else if (typeof data === 'object') {
                el.textContent = `${date} — multiple records`;
            } else {
                el.textContent = `${date} — record`;
            }
            activityEl.appendChild(el);
        });
    }

    function setupProfile(){
        try{
            const cur = JSON.parse(localStorage.getItem('currentUser')||'null') || {};
            const nameEl = document.getElementById('userFirstName');
            const emailEl = document.getElementById('userEmail');
            const pic = document.getElementById('profilePicture');
            if (nameEl) nameEl.textContent = cur.firstName || 'Admin';
            if (emailEl) emailEl.textContent = cur.email || 'faithdeves@gmail.com';
            if (pic) pic.src = cur.profilePic || 'https://ui-avatars.com/api/?name=Admin&background=3FA9FF&color=fff';

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', ()=>{
                // clear admin markers and session
                try{ localStorage.removeItem('adminSession'); localStorage.removeItem('currentUser'); sessionStorage.removeItem('sessionUser'); }catch(e){}
                window.location.href = 'login.html';
            });
        }catch(e){}
    }

    function setupProfileModal(){
        try{
            const modal = document.getElementById('profileModal');
            const profilePic = document.getElementById('profilePicture');
            const uploadBtn = document.getElementById('uploadBtn');
            const profileInput = document.getElementById('profileInput');
            const previewImage = document.getElementById('previewImage');
            const saveProfileBtn = document.getElementById('saveProfileBtn');
            const modalClose = document.getElementById('modalClose');
            const modalCancel = document.getElementById('modalCancel');
            const clearBtn = document.getElementById('clearBtn');

            if (!modal) return;

            // Open modal on profile picture click
            if (profilePic) {
                profilePic.style.cursor = 'pointer';
                profilePic.addEventListener('click', () => {
                    modal.classList.add('active');
                    const cur = JSON.parse(localStorage.getItem('currentUser')||'null') || {};
                    previewImage.src = cur.profilePic || 'https://ui-avatars.com/api/?name=Admin&background=3FA9FF&color=fff';
                });
            }

            // Choose Image button
            if (uploadBtn && profileInput) {
                uploadBtn.addEventListener('click', () => {
                    profileInput.click();
                });
            }

            // File input change
            if (profileInput) {
                profileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            previewImage.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Save profile picture
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', () => {
                    try {
                        const cur = JSON.parse(localStorage.getItem('currentUser')||'null') || {};
                        cur.profilePic = previewImage.src;
                        localStorage.setItem('currentUser', JSON.stringify(cur));

                        // Update users list if admin is in it
                        const users = JSON.parse(localStorage.getItem('users')||'[]');
                        for (let i = 0; i < users.length; i++) {
                            if (users[i].email === cur.email) {
                                users[i].profilePic = cur.profilePic;
                                break;
                            }
                        }
                        localStorage.setItem('users', JSON.stringify(users));

                        profilePic.src = previewImage.src;
                        modal.classList.remove('active');

                        // Show success notification
                        const toast = document.createElement('div');
                        toast.style.cssText = `
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            padding: 1rem 1.5rem;
                            background: #22C55E;
                            color: white;
                            border-radius: 8px;
                            z-index: 10000;
                            font-weight: 500;
                        `;
                        toast.textContent = '✅ Profile picture updated successfully';
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 3000);
                    } catch(e){
                        console.error('Error saving profile picture', e);
                    }
                });
            }

            // Clear button
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    profileInput.value = '';
                    previewImage.src = 'https://ui-avatars.com/api/?name=Admin&background=3FA9FF&color=fff';
                });
            }

            // Close modal handlers
            if (modalClose) {
                modalClose.addEventListener('click', () => {
                    modal.classList.remove('active');
                    profileInput.value = '';
                });
            }

            if (modalCancel) {
                modalCancel.addEventListener('click', () => {
                    modal.classList.remove('active');
                    profileInput.value = '';
                });
            }

            // Close modal on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    profileInput.value = '';
                }
            });
        }catch(e){
            console.error('Error setting up profile modal:', e);
        }
    }

    function setupNav() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e)=>{
                const href = item.getAttribute('href')||'';
                // simple in-page routing for admin views
                document.querySelectorAll('.admin-view').forEach(v=>v.style.display='none');
                // active state
                document.querySelectorAll('.sidebar-item').forEach(si=>si.classList.remove('active'));
                item.classList.add('active');
                if (href.indexOf('#admin-attendance')!==-1) document.getElementById('admin-attendance').style.display='block';
                else if (href.indexOf('#admin-reports')!==-1) document.getElementById('admin-reports').style.display='block';
                else if (href.indexOf('#admin-tasks')!==-1) document.getElementById('admin-tasks').style.display='block';
                else if (href.indexOf('#admin-users')!==-1) document.getElementById('admin-users').style.display='block';
                else document.getElementById('admin-dashboard-view').style.display='block';
                e.preventDefault();
            });
        });
        const allUsersBtn = document.getElementById('allUsersBtn');
        if (allUsersBtn) allUsersBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            document.querySelectorAll('.admin-view').forEach(v=>v.style.display='none');
            document.getElementById('admin-users').style.display='block';
            document.querySelectorAll('.sidebar-item').forEach(si=>si.classList.remove('active'));
        });
    }

    if (!ensureAdmin()) return;
    document.getElementById('adminGreeting').textContent = 'Welcome Admin';
    setupProfile();
    setupProfileModal();
    setupNav();
    updateMetrics();

    // Expose a refresh function for other admin modules
    window.AdminDashboard = { refresh: updateMetrics };
})();
