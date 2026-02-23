<?php
header('Content-Type: application/json');

$raw = file_get_contents('php://input');
if (!$raw) {
    echo json_encode(["success" => false, "message" => "No input provided"]);
    exit;
}

$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$action = isset($data['action']) ? $data['action'] : '';
if ($action !== 'update') {
    echo json_encode(["success" => false, "message" => "Unsupported action"]);
    exit;
}

$user = isset($data['user']) ? $data['user'] : null;
if (!$user || !isset($user['email'])) {
    echo json_encode(["success" => false, "message" => "Missing user or email"]);
    exit;
}

$dataDir = realpath(__DIR__ . '/../data') ?: (__DIR__ . '/../data');
if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

$usersFile = $dataDir . '/users.json';
$users = [];
if (file_exists($usersFile)) {
    $content = file_get_contents($usersFile);
    $users = json_decode($content, true) ?: [];
}

$found = false;
foreach ($users as &$u) {
    if (isset($u['email']) && $u['email'] === $user['email']) {
        // Update allowed fields
        $u['firstName'] = isset($user['firstName']) ? $user['firstName'] : ($u['firstName'] ?? '');
        $u['lastName'] = isset($user['lastName']) ? $user['lastName'] : ($u['lastName'] ?? '');
        $u['username'] = isset($user['username']) ? $user['username'] : ($u['username'] ?? '');
        $u['language'] = isset($user['language']) ? $user['language'] : ($u['language'] ?? 'en');
        $u['preferences'] = isset($user['preferences']) ? $user['preferences'] : ($u['preferences'] ?? []);
        $u['updatedAt'] = date('c');
        $found = true;
        break;
    }
}

if (!$found) {
    // Add as a new user record (minimally)
    $user['createdAt'] = date('c');
    $user['updatedAt'] = date('c');
    $users[] = $user;
}

$written = file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
if ($written === false) {
    echo json_encode(["success" => false, "message" => "Failed to write users file"]);
    exit;
}

echo json_encode(["success" => true, "user" => $user]);

?>