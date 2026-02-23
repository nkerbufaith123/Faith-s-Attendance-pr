-- =====================================================
-- SMART ATTENDANCE SYSTEM - SQL QUICK REFERENCE
-- Common queries for database operations
-- =====================================================

-- Database: smart_attendance_system
-- Generated for XAMPP MySQL

-- =====================================================
-- SECTION 1: BASIC QUERIES
-- =====================================================

-- Get all users
SELECT * FROM users;

-- Get all users from a specific department
SELECT * FROM users WHERE department = 'Software Engineering';

-- Get users by level
SELECT * FROM users WHERE level = '300';

-- Search user by email
SELECT * FROM users WHERE email = 'john.doe@company.com';

-- Get all departments
SELECT * FROM departments;

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- =====================================================
-- SECTION 2: ATTENDANCE QUERIES
-- =====================================================

-- Get attendance for a specific user
SELECT * FROM attendance WHERE user_id = 1 ORDER BY date DESC;

-- Get attendance for a specific date
SELECT u.first_name, u.last_name, a.check_in_time, a.check_out_time, a.work_hours 
FROM attendance a
JOIN users u ON a.user_id = u.id
WHERE a.date = '2024-02-20';

-- Get attendance for a date range
SELECT u.first_name, u.last_name, a.date, a.check_in_time, a.check_out_time, a.work_hours
FROM attendance a
JOIN users u ON a.user_id = u.id
WHERE a.date BETWEEN '2024-02-19' AND '2024-02-21'
ORDER BY a.date DESC, a.check_in_time;

-- Get total work hours for a user
SELECT user_id, SUM(work_hours) as total_hours 
FROM attendance 
WHERE user_id = 1 
GROUP BY user_id;

-- Get average work hours for department
SELECT u.department, AVG(a.work_hours) as avg_hours
FROM attendance a
JOIN users u ON a.user_id = u.id
GROUP BY u.department;

-- Get QR Code vs Manual attendance count
SELECT attendance_method, COUNT(*) as count
FROM attendance
GROUP BY attendance_method;

-- Get daily attendance report
SELECT DATE(date) as attendance_date, COUNT(*) as total_checkins
FROM attendance
GROUP BY DATE(date)
ORDER BY DATE(date) DESC;

-- Get users who didn't check in on a specific date
SELECT DISTINCT u.id, u.first_name, u.last_name
FROM users u
WHERE u.id NOT IN (SELECT DISTINCT user_id FROM attendance WHERE date = '2024-02-21');

-- =====================================================
-- SECTION 3: TASK QUERIES
-- =====================================================

-- Get all tasks
SELECT * FROM tasks;

-- Get pending tasks
SELECT * FROM tasks WHERE status = 'Pending' ORDER BY due_date ASC;

-- Get overdue tasks
SELECT * FROM tasks WHERE due_date < CURDATE() AND status != 'Completed';

-- Get tasks for a specific department
SELECT * FROM tasks WHERE department = 'Software Engineering';

-- Get tasks by level
SELECT * FROM tasks WHERE level = '300';

-- Get tasks due in next 7 days
SELECT * FROM tasks 
WHERE due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY due_date ASC;

-- Get completed tasks this month
SELECT * FROM tasks
WHERE status = 'Completed' 
AND MONTH(created_at) = MONTH(CURDATE())
AND YEAR(created_at) = YEAR(CURDATE());

-- Count tasks by status
SELECT status, COUNT(*) as count FROM tasks GROUP BY status;

-- =====================================================
-- SECTION 4: NOTIFICATION QUERIES
-- =====================================================

-- Get all unread notifications for a user
SELECT * FROM notifications 
WHERE user_id = 1 AND status = 'Unread'
ORDER BY created_at DESC;

-- Get all notifications for a user
SELECT * FROM notifications 
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 20;

-- Count unread notifications
SELECT user_id, COUNT(*) as unread_count
FROM notifications
WHERE status = 'Unread'
GROUP BY user_id;

-- Mark all notifications as read for a user
UPDATE notifications 
SET status = 'Read'
WHERE user_id = 1 AND status = 'Unread';

-- Delete old notifications (older than 30 days)
DELETE FROM notifications 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- =====================================================
-- SECTION 5: REPORTS & ANALYTICS
-- =====================================================

-- Attendance summary by user
SELECT u.id, u.first_name, u.last_name, u.department,
       COUNT(a.id) as total_days,
       AVG(a.work_hours) as avg_hours,
       MIN(a.date) as first_date,
       MAX(a.date) as last_date
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
GROUP BY u.id, u.first_name, u.last_name, u.department;

-- User activity summary
SELECT u.id, u.first_name, u.last_name,
       COUNT(a.id) as attendances,
       COUNT(n.id) as notifications
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.first_name, u.last_name;

-- Department statistics
SELECT d.department_name,
       COUNT(DISTINCT u.id) as total_users,
       COUNT(DISTINCT a.id) as total_attendance_records,
       COUNT(DISTINCT t.id) as total_tasks
FROM departments d
LEFT JOIN users u ON d.department_name = u.department
LEFT JOIN attendance a ON u.id = a.user_id
LEFT JOIN tasks t ON d.department_name = t.department
GROUP BY d.department_name;

-- Weekly attendance pattern
SELECT 
    DAYNAME(a.date) as day_name,
    COUNT(*) as checkins,
    AVG(HOUR(a.check_in_time)) as avg_checkin_hour
FROM attendance a
GROUP BY DAYOFWEEK(a.date), DAYNAME(a.date)
ORDER BY DAYOFWEEK(a.date);

-- =====================================================
-- SECTION 6: INSERT OPERATIONS
-- =====================================================

-- Add new user
INSERT INTO users (first_name, last_name, email, password, department, level)
VALUES ('David', 'Lee', 'david.lee@company.com', '$2y$10$hash_here', 'Software Engineering', '300');

-- Insert from SELECT (copy user with same department)
INSERT INTO users (first_name, last_name, email, password, department, level)
SELECT 
    'Copy', 
    CONCAT('Of', first_name), 
    CONCAT('copy.', email),
    password,
    department,
    level
FROM users WHERE id = 1;

-- Add attendance record
INSERT INTO attendance (user_id, date, check_in_time, check_out_time, attendance_method, work_hours)
VALUES (1, UUID(), '08:00:00', '16:30:00', 'QR Code', 8.5);

-- Add new task
INSERT INTO tasks (title, description, department, level, due_date, status)
VALUES (
    'New Task', 
    'Task description', 
    'Software Engineering', 
    '300', 
    '2024-03-15', 
    'Pending'
);

-- Send notification
INSERT INTO notifications (user_id, message, status, notification_type)
VALUES (1, 'Your task has been assigned', 'Unread', 'Task');

-- =====================================================
-- SECTION 7: UPDATE OPERATIONS
-- =====================================================

-- Update user department
UPDATE users SET department = 'Hardware Engineering' WHERE id = 1;

-- Update attendance work hours
UPDATE attendance SET work_hours = 8.75 WHERE id = 1;

-- Bulk update task status
UPDATE tasks SET status = 'In Progress' WHERE due_date <= CURDATE();

-- Mark notifications as read
UPDATE notifications SET status = 'Read' WHERE user_id = 1;

-- Update user password
UPDATE users SET password = '$2y$10$new_hash_here' WHERE id = 1;

-- =====================================================
-- SECTION 8: DELETE OPERATIONS
-- =====================================================

-- Delete a user (will cascade delete attendance & notifications)
DELETE FROM users WHERE id = 5;

-- Delete attendance for a specific date
DELETE FROM attendance WHERE date = '2024-02-19';

-- Delete old tasks
DELETE FROM tasks WHERE status = 'Completed' AND due_date < '2024-01-01';

-- Clear all unread notifications for a user
DELETE FROM notifications WHERE user_id = 1 AND status = 'Unread';

-- =====================================================
-- SECTION 9: JOIN OPERATIONS
-- =====================================================

-- User with attendance history
SELECT u.first_name, u.last_name, u.email, u.department,
       a.date, a.check_in_time, a.check_out_time, a.work_hours
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
ORDER BY u.id, a.date DESC;

-- User with notifications
SELECT u.first_name, u.last_name, 
       n.message, n.status, n.created_at
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id
ORDER BY n.created_at DESC;

-- Tasks with assignee department info
SELECT t.title, t.department, 
       d.id as dept_id,
       COUNT(DISTINCT u.id) as users_in_dept
FROM tasks t
LEFT JOIN departments d ON t.department = d.department_name
LEFT JOIN users u ON d.department_name = u.department
GROUP BY t.id, t.title, t.department, d.id;

-- =====================================================
-- SECTION 10: USEFUL FUNCTIONS
-- =====================================================

-- Get current timestamp
SELECT NOW() as current_timestamp;

-- Get date functions
SELECT 
    CURDATE() as today,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) as tomorrow,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY) as yesterday,
    LAST_DAY(CURDATE()) as last_day_of_month;

-- String functions
SELECT 
    CONCAT(first_name, ' ', last_name) as full_name,
    UPPER(email) as email_upper,
    LOWER(department) as department_lower
FROM users;

-- Aggregate functions
SELECT 
    COUNT(*) as total_count,
    SUM(work_hours) as total_hours,
    AVG(work_hours) as average_hours,
    MIN(work_hours) as min_hours,
    MAX(work_hours) as max_hours
FROM attendance;

-- =====================================================
-- SECTION 11: BACKUP & MAINTENANCE
-- =====================================================

-- Check database size
SELECT 
    TABLE_NAME, 
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'smart_attendance_system';

-- Optimize all tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE attendance;
OPTIMIZE TABLE tasks;
OPTIMIZE TABLE notifications;
OPTIMIZE TABLE departments;

-- Repair table if corrupted
REPAIR TABLE users;

-- Check table integrity
CHECK TABLE users;
CHECK TABLE attendance;
CHECK TABLE tasks;
CHECK TABLE notifications;
CHECK TABLE departments;

-- =====================================================
-- SECTION 12: USEFUL VIEWS (Optional)
-- Create these as permanent views for frequent queries
-- =====================================================

-- Create user attendance summary view
CREATE OR REPLACE VIEW user_attendance_summary AS
SELECT u.id, u.first_name, u.last_name, u.department,
       COUNT(a.id) as total_days,
       SUM(a.work_hours) as total_hours,
       AVG(a.work_hours) as avg_hours,
       MAX(a.date) as last_attendance
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
GROUP BY u.id, u.first_name, u.last_name, u.department;

-- Use the view:
-- SELECT * FROM user_attendance_summary;

-- =====================================================
-- END OF QUICK REFERENCE
-- =====================================================
