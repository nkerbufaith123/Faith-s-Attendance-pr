<?php
// Simple migration script: import users.json into `users` table
require_once __DIR__ . '/api/db_connect.php';

$path = __DIR__ . '/users.json';
if (!file_exists($path)) {
    echo "users.json not found at $path\n";
    exit(1);
}

$data = json_decode(file_get_contents($path), true) ?: [];
$count = 0;
foreach ($data as $u) {
    $email = $u['email'] ?? '';
    if (!$email) continue;
    $exists = executeSelect("SELECT id FROM users WHERE email = ?", [$email]);
    if (!empty($exists)) continue; // skip existing

    $full = trim(($u['firstName'] ?? '') . ' ' . ($u['lastName'] ?? ''));
    $pwd = $u['password'] ?? password_hash('changeme', PASSWORD_BCRYPT);
    $createdAt = $u['createdAt'] ?? date('Y-m-d H:i:s');

    executeInsert(
        "INSERT INTO users (department_id, full_name, email, password, role, profile_pic, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [null, $full, $email, $pwd, 'user', null, $createdAt]
    );
    $count++;
}

echo "Imported $count users\n";

?>
