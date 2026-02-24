<?php
// =====================================================
// SMART ATTENDANCE SYSTEM - DATABASE CONNECTION
// PDO Connection for XAMPP (MySQL)
// =====================================================

// Database Configuration for XAMPP
$host = "localhost";
$user = "root";
$password = "";
$database = "smart_attendance_system";
$charset = "utf8mb4";

// DSN (Data Source Name)
$dsn = "mysql:host=$host;dbname=$database;charset=$charset";

// PDO Options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    // Create PDO Connection
    $conn = new PDO($dsn, $user, $password, $options);
    
    // Set timezone for timestamps
    $conn->exec("SET time_zone = '+00:00'");
    
    // Connection successful
    // Uncomment below for debugging during development only
    // echo "Database connection successful!";
    
} catch (PDOException $e) {
    // Connection failed - log error
    http_response_code(500);
    die("Database Connection Error: " . $e->getMessage());
    
    // Note: In production, avoid exposing error details
    // Log the error instead:
    // error_log($e->getMessage());
    // die("Database connection failed. Please try again later.");
}

// =====================================================
// HELPER FUNCTIONS FOR DATABASE OPERATIONS
// =====================================================

/**
 * Execute SELECT query with parameters
 * 
 * @param string $sql SQL SELECT statement
 * @param array $params Prepared statement parameters
 * @return array Result rows
 */
function executeSelect($sql, $params = []) {
    global $conn;
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Execute INSERT query with parameters
 * 
 * @param string $sql SQL INSERT statement
 * @param array $params Prepared statement parameters
 * @return int Last inserted ID
 */
function executeInsert($sql, $params = []) {
    global $conn;
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $conn->lastInsertId();
}

/**
 * Execute UPDATE query with parameters
 * 
 * @param string $sql SQL UPDATE statement
 * @param array $params Prepared statement parameters
 * @return int Affected rows
 */
function executeUpdate($sql, $params = []) {
    global $conn;
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

/**
 * Execute DELETE query with parameters
 * 
 * @param string $sql SQL DELETE statement
 * @param array $params Prepared statement parameters
 * @return int Affected rows
 */
function executeDelete($sql, $params = []) {
    global $conn;
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

// =====================================================
// USAGE EXAMPLES
// =====================================================
/*

// SELECT Example:
$users = executeSelect("SELECT * FROM users WHERE department = ?", ['Software Engineering']);
foreach ($users as $user) {
    echo $user['first_name'];
}

// INSERT Example:
$lastId = executeInsert(
    "INSERT INTO users (first_name, last_name, email, password, department, level) VALUES (?, ?, ?, ?, ?, ?)",
    ['John', 'Doe', 'john@example.com', password_hash('password123', PASSWORD_BCRYPT), 'Software Engineering', '300']
);

// UPDATE Example:
$affected = executeUpdate(
    "UPDATE users SET department = ? WHERE id = ?",
    ['Hardware Engineering', 1]
);

// DELETE Example:
$affected = executeDelete(
    "DELETE FROM users WHERE id = ?",
    [5]
);

*/

// =====================================================
// END OF DATABASE CONNECTION FILE
// =====================================================
?>
