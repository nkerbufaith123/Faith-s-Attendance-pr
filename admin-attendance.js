// Admin attendance management
(function(){
    function ensureAdmin() { try{ const cur=JSON.parse(localStorage.getItem('currentUser')||'null'); return cur && cur.isAdmin; }catch(e){return false;} }
    if (!ensureAdmin()) return;

    function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }

    function renderDepartments(){
        // Predefined department list (15)
        const departments = [
            'Software Engineering','Hardware Maintenance','Digital Marketing','Human Resource','Networking','Cybersecurity','Data Science','AI & Machine Learning','Business IT','Cloud Computing','Web Development','Mobile App Development','UI/UX Design','Computer Systems','Information Management'
        ];
        const container = document.getElementById('departmentsList'); 
        if (!container) return;
        container.innerHTML='';
        const sel = document.createElement('select');
        sel.style.cssText = 'width:100%; padding:0.75rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:0.95rem;';
        sel.id = 'adminDeptSelect';
        sel.innerHTML = '<option value="">Select Department</option>' + departments.map(d=>`<option value="${d}">${d}</option>`).join('');
        sel.addEventListener('change', ()=> showLevelSelector(sel.value));
        container.appendChild(sel);
    }

    function showLevelSelector(dept){
        const sel = document.getElementById('departmentLevelSelector'); 
        if (!sel) return;
        sel.innerHTML='';
        if (!dept) return;
        const levels = ['Level 1','Level 2','Level 3','Masters','PhD'];
        const levelSelect = document.createElement('select');
        levelSelect.style.cssText = 'width:100%; padding:0.75rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; font-size:0.95rem;';
        levelSelect.innerHTML = '<option value="">Select Level</option>' + levels.map(l=>`<option value="${l}">${l}</option>`).join('');
        sel.appendChild(levelSelect);
    }

    function formatTime(timeStr) {
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

    function loadAttendanceFor(dept, level){
        const today = new Date().toISOString().split('T')[0];
        
        // Get users in this department and level
        const users = getUsers().filter(u => u.department === dept && u.level === level);
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
        
        // Build attendance data
        const attendanceData = users.map(u => {
            const userRecords = allRecords[u.email] || {};
            const userTodayRecord = userRecords[today] || {};
            return {
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                checkInTime: userTodayRecord.checkInTime || null,
                checkOutTime: userTodayRecord.checkOutTime || null,
                method: userTodayRecord.method || 'Manual',
                workHours: userTodayRecord.workHours || null,
                status: userTodayRecord.status === 'Present' ? 'Present' : 'Absent'
            };
        });

        // Display in activity-item format
        const container = document.getElementById('attendanceRecordsContainer');
        if (!container) return;
        
        container.innerHTML = '';

        if (attendanceData.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:2rem;">No users found for this department and level</p>';
            return;
        }

        const listHtml = attendanceData.map(rec => {
            const initials = rec.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const statusColor = rec.status === 'Present' ? '#22C55E' : '#EF4444';
            const checkInDisplay = rec.checkInTime ? formatTime(rec.checkInTime) : '—';
            const checkOutDisplay = rec.checkOutTime ? formatTime(rec.checkOutTime) : '—';
            const workHoursDisplay = rec.workHours ? `${rec.workHours}h` : '—';
            
            return `
                <div class="activity-item attendance-item" style="display:flex; align-items:center; gap:1rem; padding:1.25rem; background:linear-gradient(135deg, rgba(15, 42, 95, 0.4), rgba(63, 169, 255, 0.05)); border-radius:0.75rem; border:1px solid rgba(63, 169, 255, 0.15); transition:all 0.3s ease;">
                    <div style="width:2.5rem; height:2.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #3FA9FF, #22C55E); font-weight:bold; color:white; font-size:0.9rem; min-width:2.5rem;">${initials}</div>
                    <div style="flex:1;">
                        <div style="color:var(--text-main); font-weight:600; margin-bottom:0.5rem;">${rec.name}</div>
                        <div style="color:var(--text-secondary); font-size:0.9rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
                            <span>In: <strong>${checkInDisplay}</strong></span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span>Out: <strong>${checkOutDisplay}</strong></span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span>Hours: <strong>${workHoursDisplay}</strong></span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span>Method: <strong>${rec.method}</strong></span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span style="display:inline-block; background:${statusColor}30; border:1px solid ${statusColor}; color:${statusColor}; padding:0.25rem 0.75rem; border-radius:4px; font-size:0.8rem; font-weight:600;">${rec.status}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = listHtml;
        
        // Hide the table
        const table = document.getElementById('attendanceRecordsTable');
        if (table) table.style.display = 'none';
    }

    // Wire See Attendance button
    function wireAttendanceButton() {
        const btn = document.getElementById('attendanceSeeBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const deptSel = document.getElementById('adminDeptSelect');
            const levelSel = document.querySelector('#departmentLevelSelector select');
            if (!deptSel || !deptSel.value) { alert('Please select a department'); return; }
            if (!levelSel || !levelSel.value) { alert('Please select a level'); return; }
            
            const mapLevel = (v)=>{ 
                if (!v) return ''; 
                if (v.startsWith('Level')) return v.split(' ')[1]; 
                return v; 
            };
            loadAttendanceFor(deptSel.value, mapLevel(levelSel.value));
        });
    }

    // init
    renderDepartments();
    setTimeout(wireAttendanceButton, 100); // Wire button after DOM is ready
    window.AdminAttendance = { refresh: renderDepartments };
})();
