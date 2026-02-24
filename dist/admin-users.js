// Admin users management
(function(){
    function ensureAdmin(){ try{ const cur=JSON.parse(localStorage.getItem('currentUser')||'null'); return cur && cur.isAdmin;}catch(e){return false;} }
    if (!ensureAdmin()) return;

    function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }
    function saveUsers(arr){ localStorage.setItem('users', JSON.stringify(arr||[])); }

    const usersList = document.getElementById('usersList');
    const filterDept = document.getElementById('filterDept');
    const filterLevel = document.getElementById('filterLevel');

    function populateFilters(users){
        const depts = Array.from(new Set(users.map(u=>u.department||'Unassigned')));
        filterDept.innerHTML = '<option value="">All Departments</option>' + depts.map(d=>`<option value="${d}">${d}</option>`).join('');
    }

    function render(){
        const users = getUsers();
        populateFilters(users);
        const dept = filterDept.value;
        const level = filterLevel.value;
        
        const filtered = users.filter(u => (dept? (u.department||'Unassigned')===dept:true) && (level? String(u.level||'')===level:true));
        
        if (filtered.length === 0) {
            usersList.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:2rem;">No users found</p>';
            return;
        }
        
        usersList.innerHTML = filtered.map(u => {
            const status = u.active === false ? 'Inactive' : 'Active';
            const statusColor = u.active === false ? '#EF4444' : '#22C55E';
            const initials = ((u.firstName||'')[0] + (u.lastName||'')[0]).toUpperCase();
            const toggleBtnText = u.active === false ? 'Activate' : 'Deactivate';
            
            return `
                <div class="activity-item user-item" data-email="${u.email}">
                    <div class="activity-icon user-avatar" style="width:2.5rem; height:2.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #3FA9FF, #22C55E); font-weight:bold; color:white; font-size:0.9rem;">${initials}</div>
                    <div class="activity-content user-content">
                        <div class="activity-title user-name">${u.firstName||''} ${u.lastName||''}</div>
                        <div class="activity-time" style="display:flex; gap:1rem; align-items:center; margin-top:0.5rem;">
                            <span>${u.email}</span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span style="color:var(--text-secondary);">${u.department||'Unassigned'}</span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span style="color:var(--text-secondary);">Level ${u.level||'—'}</span>
                            <span style="color:var(--text-secondary);">•</span>
                            <span style="display:inline-block; background:${statusColor}30; border:1px solid ${statusColor}; color:${statusColor}; padding:0.25rem 0.75rem; border-radius:4px; font-size:0.8rem; font-weight:500;">${status}</span>
                        </div>
                    </div>
                    <div class="user-actions" style="display:flex; gap:0.5rem; flex-shrink:0;">
                        <button class="btn-action view-btn" title="View Details">
                            <i class="bi bi-eye" style="font-size:1rem;"></i>
                        </button>
                        <button class="btn-action toggle-btn" title="${toggleBtnText}" data-action="toggle">
                            <i class="bi bi-toggle-${u.active === false ? 'off' : 'on'}" style="font-size:1rem;"></i>
                        </button>
                        <button class="btn-action remove-btn" title="Remove User">
                            <i class="bi bi-trash" style="font-size:1rem;"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Attach event listeners
        document.querySelectorAll('.user-item').forEach(item => {
            const email = item.getAttribute('data-email');
            const user = users.find(u => u.email === email);
            
            item.querySelector('.view-btn').addEventListener('click', () => {
                alert(`${user.firstName} ${user.lastName}\nEmail: ${user.email}\nDepartment: ${user.department||'Unassigned'}\nLevel: ${user.level||'—'}\nStatus: ${user.active === false ? 'Inactive' : 'Active'}\nCreated: ${user.createdAt || 'N/A'}`);
            });
            
            item.querySelector('.toggle-btn').addEventListener('click', () => {
                user.active = !user.active;
                saveUsers(users);
                render();
            });
            
            item.querySelector('.remove-btn').addEventListener('click', () => {
                if (!confirm(`Remove ${user.firstName} ${user.lastName}?`)) return;
                const idx = users.findIndex(x => x.email === user.email);
                if (idx >= 0) {
                    users.splice(idx, 1);
                    saveUsers(users);
                    render();
                }
            });
        });
    }

    filterDept && filterDept.addEventListener('change', render);
    filterLevel && filterLevel.addEventListener('change', render);

    document.getElementById('allUsersBtn')?.addEventListener('click', () => {
        filterDept.value = '';
        filterLevel.value = '';
        render();
    });

    render();
    window.AdminUsers = { refresh: render };
})();
