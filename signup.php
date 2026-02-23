<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json');

// Start session
session_start();

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

// Validate inputs
$errors = [];

// Validate first name
if (empty($firstName)) {
    $errors['firstName'] = 'First name is required';
} elseif (strlen($firstName) < 2) {
    $errors['firstName'] = 'First name must be at least 2 characters';
} elseif (!preg_match("/^[a-zA-Z\s'-]+$/", $firstName)) {
    $errors['firstName'] = 'First name can only contain letters, spaces, hyphens, and apostrophes';
}

// Validate last name
if (empty($lastName)) {
    $errors['lastName'] = 'Last name is required';
} elseif (strlen($lastName) < 2) {
    $errors['lastName'] = 'Last name must be at least 2 characters';
} elseif (!preg_match("/^[a-zA-Z\s'-]+$/", $lastName)) {
    $errors['lastName'] = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
}

// Validate email
if (empty($email)) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Invalid email address';
}

// Validate password
if (empty($password)) {
    $errors['password'] = 'Password is required';
} elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters';
} elseif (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    $errors['password'] = 'Password must contain uppercase, lowercase, and numbers';
}

// Validate confirm password
if (empty($confirmPassword)) {
    $errors['confirmPassword'] = 'Please confirm your password';
} elseif ($password !== $confirmPassword) {
    $errors['confirmPassword'] = 'Passwords do not match';
}

// If there are validation errors, return them
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}
// Use database for storing users
require_once __DIR__ . '/api/db_connect.php';

$fullName = trim($firstName . ' ' . $lastName);
$hash = password_hash($password, PASSWORD_BCRYPT);

// Check if email already exists in DB
$existing = executeSelect("SELECT id FROM users WHERE email = ?", [$email]);
if (!empty($existing)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Insert into DB
try {
    $userId = executeInsert(
        "INSERT INTO users (department_id, full_name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [null, $fullName, $email, $hash, 'user', date('Y-m-d H:i:s')]
    );

    if ($userId) {
        $_SESSION['user'] = [
            'id' => $userId,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email
        ];

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'user' => $_SESSION['user']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create account']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
}
?>
