// Admin tasks management
(function(){
    function ensureAdmin(){ try{ const cur=JSON.parse(localStorage.getItem('currentUser')||'null'); return cur && cur.isAdmin;}catch(e){return false;} }
    if (!ensureAdmin()) return;

    function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }
    function getTasks(){ return JSON.parse(localStorage.getItem('tasks')||'[]'); }
    function saveTasks(t){ localStorage.setItem('tasks', JSON.stringify(t||[])); }

    const form = document.getElementById('taskForm');
    const deptSelect = document.getElementById('taskDept');
    const levelSelect = document.getElementById('taskLevel');
    const tasksList = document.getElementById('tasksList');

    const departments = ['Software Engineering','Hardware Maintenance','Digital Marketing','Human Resource','Networking','Cybersecurity','Data Science','AI & Machine Learning','Business IT','Cloud Computing','Web Development','Mobile App Development','UI/UX Design','Computer Systems','Information Management'];
    const levels = ['Level 1','Level 2','Level 3','Masters','PhD'];

    // Populate department dropdown
    function populateDepts() {
        if (!deptSelect) return;
        deptSelect.innerHTML = '<option value="">Select Department</option>' + departments.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    // Populate level dropdown
    function populateLevels() {
        if (!levelSelect) return;
        levelSelect.innerHTML = '<option value="">Select Level</option>' + levels.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    function render(){
        const tasks = getTasks();
        tasksList.innerHTML = '';
        if (!tasks.length) { tasksList.textContent='No tasks.'; return; }
        tasks.forEach((t, i)=>{
            const el = document.createElement('div'); el.className='activity-item';
            el.innerHTML = `<div class="activity-content"><div class="activity-title"><strong>${t.title}</strong></div><div class="activity-time">${t.department} • ${t.level} • ${t.deadline||''}</div><div style="margin-top:6px;color:var(--text-secondary)">${t.description||''}</div></div><div style="margin-left:16px; text-align:right;">Status: <strong>${t.status||'OPEN'}</strong><div style="margin-top:8px;"><button class='btn-sm send'>Notify All</button> <button class='btn-sm done'>Mark Done</button></div></div>`;
            el.querySelector('.send').addEventListener('click', ()=>sendNotificationToAll(t));
            el.querySelector('.done').addEventListener('click', ()=>{ t.status='DONE'; saveTasks(tasks); render(); });
            tasksList.appendChild(el);
        });
    }

    function sendNotificationToAll(task){
        // Find all matching users and generate mailto with all emails
        const matchingUsers = getUsers().filter(u => u.department === task.department && u.level === task.level);
        if (!matchingUsers.length) { alert('No users found for this department and level'); return; }
        const emails = matchingUsers.map(u => u.email).join(';');
        const subject = encodeURIComponent('New Task: '+task.title);
        const body = encodeURIComponent((task.description||'') + '\nDeadline: '+(task.deadline||'N/A'));
        window.open(`mailto:${emails}?subject=${subject}&body=${body}`);
        task.notifiedAt = new Date().toISOString();
        const tasks = getTasks(); const idx = tasks.findIndex(x=>x.createdAt===task.createdAt); if (idx>=0){ tasks[idx]=task; saveTasks(tasks); }
        render();
    }

    form && form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const title = document.getElementById('taskTitle').value.trim();
        const desc = document.getElementById('taskDesc').value.trim();
        const fileInput = document.getElementById('taskFile');
        const dept = deptSelect.value;
        const level = levelSelect.value;
        const deadline = document.getElementById('taskDeadline').value;

        if (!title) return alert('Task title required');
        if (!dept) return alert('Department required');
        if (!level) return alert('Level required');

        // Get file name if uploaded
        const fileName = fileInput && fileInput.files[0] ? fileInput.files[0].name : '';

        // Get matching users
        const matchingUsers = getUsers().filter(u => u.department === dept && u.level === level);
        if (!matchingUsers.length) return alert('No users found for selected department and level');

        // Create task object
        const tasks = getTasks();
        const t = { 
            title, 
            description: desc, 
            file: fileName,
            department: dept, 
            level: level, 
            deadline, 
            status: 'OPEN', 
            assignedToUsers: matchingUsers.map(u => u.email),
            createdAt: new Date().toISOString() 
        };
        tasks.push(t);
        saveTasks(tasks);

        // Distribute task to each user's personal task list using TaskManager if available
        const userEmails = matchingUsers.map(u => u.email);
        if (window.TaskManager && window.TaskManager.assignTaskToUsers) {
            window.TaskManager.assignTaskToUsers(t.createdAt, userEmails);
        } else {
            // Fallback: manually distribute to userTasks
            const userTasks = JSON.parse(localStorage.getItem('userTasks') || '{}');
            matchingUsers.forEach(user => {
                if (!userTasks[user.email]) userTasks[user.email] = [];
                if (!userTasks[user.email].find(ut => ut.createdAt === t.createdAt)) {
                    userTasks[user.email].push({...t, assignedTo: user.email});
                }
            });
            localStorage.setItem('userTasks', JSON.stringify(userTasks));
        }

        render();
        sendNotificationToAll(t);
        form.reset();
    });

    populateDepts();
    populateLevels();
    render();
    window.AdminTasks = { refresh: render };
})();
