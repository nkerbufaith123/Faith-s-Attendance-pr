-- =====================================================
-- SMART ATTENDANCE SYSTEM - DATABASE SCHEMA
-- Created for XAMPP (MySQL + Apache)
-- =====================================================

-- Drop existing database if it exists
DROP DATABASE IF EXISTS `smart_attendance_system`;

-- Create new database
CREATE DATABASE `smart_attendance_system` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `smart_attendance_system`;

-- =====================================================
-- 1. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE `departments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `department_name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_department_name` (`department_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(100),
  `level` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_department` (`department`),
  FOREIGN KEY (`department`) REFERENCES `departments`(`department_name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE `attendance` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `check_in_time` TIME,
  `check_out_time` TIME,
  `attendance_method` ENUM('Manual', 'QR Code') DEFAULT 'Manual',
  `work_hours` DECIMAL(5, 2),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_date` (`user_id`, `date`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_date` (`date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TASKS TABLE
-- =====================================================
CREATE TABLE `tasks` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `file_path` VARCHAR(255),
  `department` VARCHAR(100),
  `level` VARCHAR(50),
  `due_date` DATE,
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Overdue') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_department` (`department`),
  INDEX `idx_level` (`level`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`department`) REFERENCES `departments`(`department_name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Unread', 'Read') DEFAULT 'Unread',
  `notification_type` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert Departments
INSERT INTO `departments` (`department_name`) VALUES
('Software Engineering'),
('Hardware Engineering'),
('Networking'),
('Cybersecurity');

-- Insert Sample Users
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `department`, `level`, `created_at`) VALUES
('John', 'Doe', 'john.doe@company.com', '$2y$10$abc123xyz...', 'Software Engineering', '300', '2024-01-15 08:00:00'),
('Jane', 'Smith', 'jane.smith@company.com', '$2y$10$def456uvw...', 'Hardware Engineering', '200', '2024-02-10 09:30:00'),
('Michael', 'Johnson', 'michael.johnson@company.com', '$2y$10$ghi789rst...', 'Networking', '300', '2024-01-20 07:45:00'),
('Sarah', 'Williams', 'sarah.williams@company.com', '$2y$10$jkl012opq...', 'Cybersecurity', '400', '2024-02-05 08:15:00'),
('Robert', 'Brown', 'robert.brown@company.com', '$2y$10$mno345lkj...', 'Software Engineering', '200', '2024-02-12 10:00:00');

-- Insert Sample Attendance Records
INSERT INTO `attendance` (`user_id`, `date`, `check_in_time`, `check_out_time`, `attendance_method`, `work_hours`) VALUES
(1, '2024-02-20', '08:00:00', '16:30:00', 'QR Code', 8.5),
(1, '2024-02-21', '08:15:00', '16:45:00', 'QR Code', 8.5),
(2, '2024-02-20', '08:30:00', '17:00:00', 'Manual', 8.5),
(2, '2024-02-21', '08:45:00', '17:15:00', 'QR Code', 8.5),
(3, '2024-02-20', '08:00:00', '16:30:00', 'QR Code', 8.5),
(4, '2024-02-20', '09:00:00', '17:30:00', 'Manual', 8.5),
(5, '2024-02-21', '08:00:00', '16:45:00', 'QR Code', 8.75),
(1, '2024-02-19', '08:00:00', '16:00:00', 'QR Code', 8.0),
(3, '2024-02-21', '08:10:00', '16:40:00', 'QR Code', 8.5),
(4, '2024-02-21', '09:00:00', '17:15:00', 'QR Code', 8.25);

-- Insert Sample Tasks
INSERT INTO `tasks` (`title`, `description`, `file_path`, `department`, `level`, `due_date`, `status`) VALUES
('Database Design Phase', 'Complete the database schema and optimization', '/uploads/db-design.pdf', 'Software Engineering', '300', '2024-03-15', 'In Progress'),
('Network Security Audit', 'Conduct comprehensive security audit of network infrastructure', '/uploads/audit-report.docx', 'Networking', '400', '2024-03-10', 'Pending'),
('Hardware Inventory Update', 'Update and catalog all hardware assets', '/uploads/inventory.xlsx', 'Hardware Engineering', '200', '2024-02-28', 'In Progress'),
('Cybersecurity Training', 'Complete online cybersecurity certification course', '/uploads/cert-link.txt', 'Cybersecurity', '300', '2024-03-30', 'Pending'),
('API Development', 'Develop RESTful API for mobile attendance app', '/uploads/api-specs.pdf', 'Software Engineering', '400', '2024-03-20', 'In Progress'),
('System Documentation', 'Write comprehensive system documentation', '/uploads/docs.md', 'Software Engineering', '200', '2024-03-05', 'Pending'),
('Router Configuration', 'Configure and test network routers', '/uploads/config-guide.pdf', 'Networking', '300', '2024-02-25', 'Completed'),
('Incident Response Plan', 'Develop cybersecurity incident response procedures', '/uploads/incident-plan.docx', 'Cybersecurity', '400', '2024-03-25', 'Pending');

-- Insert Sample Notifications
INSERT INTO `notifications` (`user_id`, `message`, `status`, `notification_type`) VALUES
(1, 'Your attendance for 2024-02-21 has been recorded. Check-in: 08:15, Check-out: 16:45', 'Read', 'Attendance'),
(1, 'New task assigned: API Development. Due: 2024-03-20', 'Unread', 'Task'),
(2, 'Your check-in time on 2024-02-20 was marked manually. Please use QR code next time.', 'Read', 'Attendance'),
(3, 'Reminder: Complete your cybersecurity training by 2024-03-30', 'Unread', 'Task'),
(4, 'Your attendance record has been updated. Check-in: 09:00, Check-out: 17:30', 'Read', 'Attendance'),
(2, 'Team meeting scheduled for 2024-02-22 at 10:00 AM', 'Unread', 'Alert'),
(5, 'Welcome to the Smart Attendance System! Your account has been created.', 'Read', 'System'),
(3, 'Attendance summary: 95% present this month', 'Unread', 'Report');

-- =====================================================
-- INDEXES FOR OPTIMIZATION
-- =====================================================

ALTER TABLE `attendance` ADD INDEX `idx_check_in` (`check_in_time`);
ALTER TABLE `tasks` ADD INDEX `idx_due_date` (`due_date`);
ALTER TABLE `notifications` ADD INDEX `idx_created_at` (`created_at`);

-- =====================================================
-- DATABASE SETUP COMPLETE
-- =====================================================
-- Database: smart_attendance_system
-- Tables: 5 (departments, users, attendance, tasks, notifications)
-- Sample Records: Included for development/testing
-- 
-- ✓ XAMPP Compatible (MySQL 5.7+)
-- ✓ UTF8MB4 Encoding
-- ✓ Foreign Key Relationships with CASCADE
-- ✓ Optimized Indexes
-- ✓ Timestamps for auditing
-- =====================================================
