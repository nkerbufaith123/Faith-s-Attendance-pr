// Task Manager - Centralized task management for both admin and user
(function(){
    const STORAGE_KEY = 'userTasks';
    const GLOBAL_TASKS_KEY = 'tasks';

    // Get tasks assigned to current user
    function getCurrentUserTasks() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (!currentUser || !currentUser.email) return [];
            
            const userTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return userTasks[currentUser.email] || [];
        } catch (e) {
            console.error('Error getting user tasks:', e);
            return [];
        }
    }

    // Get all global tasks (admin view)
    function getAllTasks() {
        try {
            return JSON.parse(localStorage.getItem(GLOBAL_TASKS_KEY) || '[]');
        } catch (e) {
            console.error('Error getting all tasks:', e);
            return [];
        }
    }

    // Assign task to user(s) by email
    function assignTaskToUsers(taskId, userEmails) {
        try {
            const allTasks = getAllTasks();
            const task = allTasks.find(t => t.createdAt === taskId);
            if (!task) return false;

            const userTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            
            if (typeof userEmails === 'string') {
                userEmails = [userEmails];
            }

            userEmails.forEach(email => {
                if (!userTasks[email]) userTasks[email] = [];
                // Check if task already assigned
                if (!userTasks[email].find(t => t.createdAt === taskId)) {
                    userTasks[email].push({...task, assignedTo: email});
                }
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(userTasks));
            return true;
        } catch (e) {
            console.error('Error assigning task:', e);
            return false;
        }
    }

    // Update task status
    function updateTaskStatus(taskId, status) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (!currentUser || !currentUser.email) return false;

            const userTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const tasks = userTasks[currentUser.email] || [];
            
            const task = tasks.find(t => t.createdAt === taskId);
            if (task) {
                task.status = status;
                if (!userTasks[currentUser.email]) userTasks[currentUser.email] = [];
                const idx = userTasks[currentUser.email].findIndex(t => t.createdAt === taskId);
                if (idx >= 0) userTasks[currentUser.email][idx] = task;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userTasks));
            }

            // Also update in global tasks if user is admin
            const allTasks = getAllTasks();
            const globalTask = allTasks.find(t => t.createdAt === taskId);
            if (globalTask) {
                globalTask.status = status;
                localStorage.setItem(GLOBAL_TASKS_KEY, JSON.stringify(allTasks));
            }

            return true;
        } catch (e) {
            console.error('Error updating task status:', e);
            return false;
        }
    }

    // Remove task from user
    function removeTaskFromUser(taskId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (!currentUser || !currentUser.email) return false;

            const userTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (userTasks[currentUser.email]) {
                userTasks[currentUser.email] = userTasks[currentUser.email].filter(t => t.createdAt !== taskId);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userTasks));
            }

            return true;
        } catch (e) {
            console.error('Error removing task:', e);
            return false;
        }
    }

    // Sync tasks from global list for current user
    function syncUserTasks() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (!currentUser || !currentUser.email) return;

            const allTasks = getAllTasks();
            const userTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            if (!userTasks[currentUser.email]) {
                userTasks[currentUser.email] = [];
            }

            // Get all tasks assigned to this user's department and level
            const matchingGlobalTasks = allTasks.filter(t => 
                t.department === currentUser.department && 
                t.level === currentUser.level
            );

            // Add matching tasks if not already present
            matchingGlobalTasks.forEach(task => {
                if (!userTasks[currentUser.email].find(t => t.createdAt === task.createdAt)) {
                    userTasks[currentUser.email].push({...task, assignedTo: currentUser.email});
                }
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(userTasks));
        } catch (e) {
            console.error('Error syncing user tasks:', e);
        }
    }

    // Get task count by status
    function getTaskCountByStatus(status) {
        try {
            const tasks = getCurrentUserTasks();
            return tasks.filter(t => t.status === status).length;
        } catch (e) {
            console.error('Error getting task count:', e);
            return 0;
        }
    }

    // Export functions
    window.TaskManager = {
        getCurrentUserTasks,
        getAllTasks,
        assignTaskToUsers,
        updateTaskStatus,
        removeTaskFromUser,
        syncUserTasks,
        getTaskCountByStatus
    };
})();
