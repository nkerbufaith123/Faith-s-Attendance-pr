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
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$rememberMe = isset($_POST['rememberMe']) ? (bool)$_POST['rememberMe'] : false;

// Validate inputs
$errors = [];

// Validate email
if (empty($email)) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address';
}

// Validate password
if (empty($password)) {
    $errors['password'] = 'Password is required';
}

// If there are validation errors, return them
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Check if user exists
$usersFile = 'users.json';

if (!file_exists($usersFile)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

$users = json_decode(file_get_contents($usersFile), true) ?? [];

// Find user by email
$user = null;
foreach ($users as $u) {
    if ($u['email'] === $email) {
        $user = $u;
        break;
    }
}

// Check if user exists
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Check if user is active
if ($user['status'] !== 'active') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Account is inactive']);
    exit;
}

// Set session
$_SESSION['user'] = [
    'id' => $user['id'],
    'firstName' => $user['firstName'],
    'lastName' => $user['lastName'],
    'email' => $user['email'],
    'loginTime' => date('Y-m-d H:i:s')
];

// Set remember me cookie if requested (30 days)
if ($rememberMe) {
    setcookie('rememberMe', $email, time() + (30 * 24 * 60 * 60), '/');
}

// Update last login time in users file (optional)
foreach ($users as &$u) {
    if ($u['id'] === $user['id']) {
        $u['lastLogin'] = date('Y-m-d H:i:s');
        break;
    }
}
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => $_SESSION['user']
]);
?>
