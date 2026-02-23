# Smart Attendance System - Database Setup Guide

## 📋 Overview
This guide provides step-by-step instructions to set up the `smart_attendance_system` database with XAMPP.

---

## 🗂️ Files Created

1. **smart_attendance_system.sql** - Complete database schema with sample data
2. **api/db_connect.php** - PDO database connection file

---

## ⚙️ XAMPP Installation & Setup

### Step 1: Ensure XAMPP is Installed
- Download XAMPP from: https://www.apachefriends.org/
- Install with MySQL and Apache enabled

### Step 2: Start XAMPP Services
1. Open XAMPP Control Panel
2. Start **Apache** (click "Start" button)
3. Start **MySQL** (click "Start" button)
4. Both should show green indicators

### Step 3: Access phpMyAdmin
1. Open your browser
2. Navigate to: `http://localhost/phpmyadmin`
3. Login (default: username=root, no password)

---

## 🗄️ Database Creation Methods

### **METHOD 1: Using phpMyAdmin (Recommended for Beginners)**

1. **Open phpMyAdmin**
   - Navigate to `http://localhost/phpmyadmin`

2. **Import SQL File**
   - Click on **"Import"** tab (top menu)
   - Click **"Choose File"**
   - Select: `smart_attendance_system.sql`
   - Click **"Import"** button
   - Wait for completion message

3. **Verify Database**
   - Look for `smart_attendance_system` in left sidebar
   - Click it to expand and view all tables

---

### **METHOD 2: Using MySQL Command Line**

1. **Open Command Prompt/PowerShell**
   ```powershell
   # Navigate to XAMPP MySQL bin directory
   cd "C:\xampp\mysql\bin"
   
   # Login to MySQL
   mysql -u root
   ```

2. **Import the SQL File**
   ```sql
   USE mysql;
   
   -- Then import the SQL file:
   SOURCE "C:\Users\DELL PC\Downloads\Faith's attendance system\smart_attendance_system.sql"
   ```

3. **Verify Installation**
   ```sql
   USE smart_attendance_system;
   SHOW TABLES;
   ```

---

### **METHOD 3: Using Windows Terminal (Direct)**

```powershell
# One-line import command:
cd "C:\xampp\mysql\bin"
mysql -u root < "C:\Users\DELL PC\Downloads\Faith's attendance system\smart_attendance_system.sql"
```

---

## 📝 Database Schema Summary

| Table | Fields | Purpose |
|-------|--------|---------|
| **departments** | id, department_name, created_at | Store department information |
| **users** | id, first_name, last_name, email, password, department, level, created_at | User accounts and profiles |
| **attendance** | id, user_id, date, check_in_time, check_out_time, attendance_method, work_hours | Daily attendance records |
| **tasks** | id, title, description, file_path, department, level, due_date, status | Task management |
| **notifications** | id, user_id, message, status, notification_type | User notifications |

---

## 🔐 Database Relationships

```
departments
    ↓
users (department FK → departments.department_name)
    ↓
attendance (user_id FK → users.id)
notifications (user_id FK → users.id)

tasks (department FK → departments.department_name)
```

**Foreign Key Rules:**
- ✅ CASCADE DELETE on users → attendance/notifications
- ✅ SET NULL on departments → users/tasks

---

## 📊 Sample Data Included

### Users (5 sample records)
- John Doe (Software Engineering, Level 300)
- Jane Smith (Hardware Engineering, Level 200)
- Michael Johnson (Networking, Level 300)
- Sarah Williams (Cybersecurity, Level 400)
- Robert Brown (Software Engineering, Level 200)

### Attendance (10 sample records)
- Check-in/check-out times for Feb 19-21, 2024
- Mix of QR Code and Manual methods
- Calculated work hours

### Tasks (8 sample records)
- Various statuses: Pending, In Progress, Completed
- Assigned to different departments and levels

### Notifications (8 sample records)
- Attendance alerts
- Task notifications
- System messages

---

## 🔗 Using db_connect.php

### Basic Usage

```php
<?php
// Include the connection file
require_once 'api/db_connect.php';

// SELECT Query
$users = executeSelect(
    "SELECT * FROM users WHERE department = ?", 
    ['Software Engineering']
);

// INSERT Query
$lastId = executeInsert(
    "INSERT INTO users (first_name, last_name, email, password, department, level) 
     VALUES (?, ?, ?, ?, ?, ?)",
    ['Jane', 'Doe', 'jane@example.com', password_hash('pass123', PASSWORD_BCRYPT), 'Software Engineering', '300']
);

// UPDATE Query
$affected = executeUpdate(
    "UPDATE users SET department = ? WHERE id = ?",
    ['Hardware Engineering', 1]
);

// DELETE Query
$affected = executeDelete(
    "DELETE FROM users WHERE id = ?",
    [5]
);

echo "Success!";
?>
```

### Features of db_connect.php

✅ **PDO Connection** - Secure prepared statements  
✅ **Error Handling** - Exception-based error reporting  
✅ **Helper Functions** - executeSelect, executeInsert, executeUpdate, executeDelete  
✅ **UTF8MB4 Support** - Full emoji and international character support  
✅ **Timezone Set** - UTC timezone for consistency  
✅ **Production Ready** - Prevents SQL injection attacks  

---

## ✅ Verification Checklist

After setup, verify:

### 1. Database Exists
```sql
SHOW DATABASES LIKE 'smart_attendance_system';
```

### 2. All Tables Created
```sql
USE smart_attendance_system;
SHOW TABLES;
```

Expected output:
```
+-----------------------------------+
| Tables_in_smart_attendance_system |
+-----------------------------------+
| attendance                        |
| departments                       |
| notifications                     |
| tasks                             |
| users                             |
+-----------------------------------+
```

### 3. Sample Data Loaded
```sql
SELECT COUNT(*) FROM users;        -- Should return 5
SELECT COUNT(*) FROM attendance;   -- Should return 10
SELECT COUNT(*) FROM tasks;        -- Should return 8
SELECT COUNT(*) FROM notifications; -- Should return 8
```

### 4. Foreign Keys Working
```sql
-- Check table constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'smart_attendance_system' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 5. Test PHP Connection
Create a test file (`test_db.php`):
```php
<?php
require_once 'api/db_connect.php';

try {
    $users = executeSelect("SELECT COUNT(*) as count FROM users");
    echo "✅ Database Connection Successful!<br>";
    echo "Total Users: " . $users[0]['count'];
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

Access it at: `http://localhost/smart-attendance/test_db.php`

---

## 🚀 Deployment to htdocs

### Step 1: Move Project Folder
```powershell
# Move the entire project to htdocs
Move-Item "C:\Users\DELL PC\Downloads\Faith's attendance system" "C:\xampp\htdocs\smart-attendance"
```

### Step 2: Folder Structure Should Look Like
```
C:\xampp\htdocs\smart-attendance\
├── api/
│   ├── db_connect.php       ← Database connection
│   ├── attendance.php
│   ├── account.php
│   └── ...
├── smart_attendance_system.sql  ← SQL file (for reference)
├── index.html
├── login.html
├── dashboard.html
└── ...
```

### Step 3: Access Application
- **Home**: `http://localhost/smart-attendance`
- **Admin Dashboard**: `http://localhost/smart-attendance/admin-dashboard.html`
- **Attendance**: `http://localhost/smart-attendance/attendance.html`
- **phpMyAdmin**: `http://localhost/phpmyadmin` (for database management)

---

## 🔧 Troubleshooting

### Problem: "Connection failed" Error
**Solution:**
1. Verify MySQL is running in XAMPP Control Panel
2. Check username/password in `db_connect.php` (should be root/empty)
3. Confirm database name is `smart_attendance_system`

### Problem: "Unknown table" Error
**Solution:**
1. Verify all tables were imported: Run `SHOW TABLES;` in phpMyAdmin
2. Re-import the SQL file if tables are missing
3. Check character set in phpMyAdmin (should be utf8mb4)

### Problem: "Access Denied for user 'root'@'localhost'"
**Solution:**
1. XAMPP MySQL default has no password
2. Update `db_connect.php` password field to empty string `""`
3. Ensure MySQL service is running

### Problem: Foreign Key Constraint Error
**Solution:**
1. In phpMyAdmin, go to database settings
2. Enable "Foreign key checks" is turned on
3. Re-import SQL file to ensure proper table creation order

---

## 📋 Configuration Reference

### XAMPP MySQL Defaults (in db_connect.php)
```php
$host = "localhost";     // MySQL server
$user = "root";          // Default XAMPP user
$password = "";          // No password by default
$database = "smart_attendance_system";
$charset = "utf8mb4";    // Full Unicode support
```

### PHP Settings Required
- PHP 7.2+ (XAMPP includes this)
- PDO MySQL extension (enabled by default)
- OpenSSL for secure passwords

### MySQL Requirements
- MySQL 5.7+ (XAMPP includes 5.7.x or 8.x)
- InnoDB engine (default)
- UTF8MB4 character set

---

## 📚 Additional Notes

### Password Hashing
Passwords in sample data are placeholders. When adding real users, always hash passwords:
```php
$hashed_password = password_hash($user_password, PASSWORD_BCRYPT);
```

### Timezone Handling
Database is set to UTC. In PHP, adjust for local timezone:
```php
date_default_timezone_set('Africa/Lagos'); // Or your timezone
```

### Backup Database
```powershell
# Export database for backup
mysqldump -u root smart_attendance_system > backup.sql

# Restore from backup
mysql -u root smart_attendance_system < backup.sql
```

---

## ✨ You're All Set!

Your Smart Attendance System database is now ready for production use:

✅ Database created with proper schema  
✅ Foreign key relationships established  
✅ Sample data loaded for testing  
✅ Secure PDO connection configured  
✅ XAMPP compatible and optimized  

**Next Steps:**
1. Move project to `C:\xampp\htdocs\smart-attendance`
2. Start Apache and MySQL
3. Test the application at `http://localhost/smart-attendance`
4. Use phpMyAdmin for database management: `http://localhost/phpmyadmin`

---

**Questions or Issues?** Check the troubleshooting section above.
