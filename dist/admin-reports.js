// Admin Reports Management - See all user reports
(function(){
    function ensureAdmin() { 
        try{ 
            const cur = JSON.parse(localStorage.getItem('currentUser')||'null'); 
            return cur && cur.isAdmin;
        } catch(e){
            return false;
        } 
    }
    if (!ensureAdmin()) return;

    // Get all users
    function getUsers(){ 
        return JSON.parse(localStorage.getItem('users')||'[]'); 
    }

    // Get all reports for all users
    function getAllReports() {
        const users = getUsers();
        const allReports = [];

        users.forEach(user => {
            if (user.email) {
                const userReportsKey = `reports-${user.email}`;
                const userReports = JSON.parse(localStorage.getItem(userReportsKey) || '[]');
                
                userReports.forEach(report => {
                    allReports.push({
                        ...report,
                        userName: `${user.firstName} ${user.lastName}`,
                        userEmail: user.email,
                        userDept: user.department || 'Unassigned',
                        userLevel: user.level || '—'
                    });
                });
            }
        });

        // Sort by date (newest first)
        return allReports.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }

    // Format date to readable format
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch(e) {
            return dateStr;
        }
    }

    // Render all reports in card format
    function renderAllReports() {
        const container = document.getElementById('reportsList');
        if (!container) return;

        const allReports = getAllReports();
        
        if (allReports.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:2rem;">No reports submitted yet</p>';
            return;
        }

        const reportsHtml = allReports.map((report, idx) => {
            const statusColor = report.status === 'completed' ? '#22C55E' : report.status === 'in-progress' ? '#FFC107' : '#3FA9FF';
            const statusText = report.status === 'completed' ? 'Completed' : report.status === 'in-progress' ? 'In Progress' : 'Pending';
            const initials = ((report.userName || 'U')[0] + (report.userName.split(' ')[1] || 'U')[0]).toUpperCase();
            
            return `
                <div class="activity-item report-item" data-idx="${idx}" style="display:flex; align-items:flex-start; gap:1rem; padding:1.25rem; background:linear-gradient(135deg, rgba(15, 42, 95, 0.4), rgba(63, 169, 255, 0.05)); border-radius:0.75rem; border:1px solid rgba(63, 169, 255, 0.15); transition:all 0.3s ease;">
                    <div style="width:2.5rem; height:2.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #3FA9FF, #22C55E); font-weight:bold; color:white; font-size:0.9rem; min-width:2.5rem;">${initials}</div>
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.75rem;">
                            <div>
                                <div style="color:var(--text-main); font-weight:600; font-size:1.05rem;">${report.title || 'Untitled Report'}</div>
                                <div style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">${report.userName} • ${report.userEmail}</div>
                            </div>
                            <span style="display:inline-block; background:${statusColor}30; border:1px solid ${statusColor}; color:${statusColor}; padding:0.35rem 0.85rem; border-radius:4px; font-size:0.8rem; font-weight:600; white-space:nowrap;">${statusText}</span>
                        </div>
                        
                        <div style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.75rem; display:flex; gap:1rem; flex-wrap:wrap;">
                            <span><i class="bi bi-calendar-event" style="margin-right:0.25rem;"></i>${formatDate(report.createdAt)}</span>
                            <span>•</span>
                            <span><i class="bi bi-building" style="margin-right:0.25rem;"></i>${report.userDept}</span>
                            <span>•</span>
                            <span><i class="bi bi-layer-forward" style="margin-right:0.25rem;"></i>Level ${report.userLevel}</span>
                        </div>

                        <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:1rem; margin-bottom:0.75rem;">
                            <div style="color:var(--text-secondary); font-size:0.85rem; font-weight:500; margin-bottom:0.5rem; text-transform:uppercase;">Report Content</div>
                            <div style="color:var(--text-main); font-size:0.95rem; line-height:1.5; max-height:120px; overflow-y:auto;">
                                ${report.description || report.content || 'No content provided'}
                            </div>
                        </div>

                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                            <button class="btn-action view-report-btn" title="View Full Report" data-idx="${idx}">
                                <i class="bi bi-eye" style="font-size:1rem;"></i>
                            </button>
                            <button class="btn-action mark-complete-btn" title="Mark as Completed" data-idx="${idx}" ${report.status === 'completed' ? 'disabled' : ''}>
                                <i class="bi bi-check-circle" style="font-size:1rem;"></i>
                            </button>
                            <button class="btn-action delete-report-btn" title="Delete Report" data-idx="${idx}">
                                <i class="bi bi-trash" style="font-size:1rem;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = reportsHtml;

        // Attach event listeners
        document.querySelectorAll('.report-item').forEach(item => {
            const idx = item.getAttribute('data-idx');
            const report = allReports[idx];

            item.querySelector('.view-report-btn').addEventListener('click', () => {
                alert(`📋 REPORT DETAILS\n\n` +
                    `Title: ${report.title}\n` +
                    `Submitted by: ${report.userName}\n` +
                    `Email: ${report.userEmail}\n` +
                    `Department: ${report.userDept}\n` +
                    `Level: Level ${report.userLevel}\n` +
                    `Status: ${report.status}\n` +
                    `Date: ${formatDate(report.createdAt)}\n\n` +
                    `CONTENT:\n${report.description || report.content || 'No content'}`
                );
            });

            item.querySelector('.mark-complete-btn').addEventListener('click', () => {
                const users = getUsers();
                const user = users.find(u => u.email === report.userEmail);
                
                if (user) {
                    const userReportsKey = `reports-${user.email}`;
                    const userReports = JSON.parse(localStorage.getItem(userReportsKey) || '[]');
                    const reportIdx = userReports.findIndex(r => r.title === report.title && r.createdAt === report.createdAt);
                    
                    if (reportIdx >= 0) {
                        userReports[reportIdx].status = 'completed';
                        localStorage.setItem(userReportsKey, JSON.stringify(userReports));
                        renderAllReports();
                    }
                }
            });

            item.querySelector('.delete-report-btn').addEventListener('click', () => {
                if (!confirm('Delete this report?')) return;
                
                const users = getUsers();
                const user = users.find(u => u.email === report.userEmail);
                
                if (user) {
                    const userReportsKey = `reports-${user.email}`;
                    const userReports = JSON.parse(localStorage.getItem(userReportsKey) || '[]');
                    const reportIdx = userReports.findIndex(r => r.title === report.title && r.createdAt === report.createdAt);
                    
                    if (reportIdx >= 0) {
                        userReports.splice(reportIdx, 1);
                        localStorage.setItem(userReportsKey, JSON.stringify(userReports));
                        renderAllReports();
                    }
                }
            });
        });
    }

    // Initialize
    setTimeout(() => {
        renderAllReports();
    }, 100);

    // Expose refresh function
    window.AdminReports = { refresh: renderAllReports };
})();
