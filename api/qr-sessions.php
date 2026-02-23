<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : (isset($_GET['action'])?$_GET['action']:null);

$file = __DIR__ . '/../data/qr-sessions.json';
if (!file_exists(dirname($file))) { mkdir(dirname($file), 0755, true); }
if (!file_exists($file)) { file_put_contents($file, json_encode([])); }

$sessions = json_decode(file_get_contents($file), true);
if (!is_array($sessions)) $sessions = [];

if (!$action) {
    echo json_encode(['success'=>false, 'message'=>'No action provided']);
    exit;
}

switch ($action) {
    case 'create':
        // Create new QR session (backend generation)
        if (!isset($input['session_id']) || !isset($input['token'])) {
            echo json_encode(['success'=>false, 'message'=>'Missing session_id or token']);
            break;
        }
        
        $session = [
            'session_id' => $input['session_id'],
            'token' => $input['token'],
            'created_time' => date('c'),
            'created_timestamp' => time(),
            'expiry_time' => date('c', time() + 60),
            'expiry_timestamp' => time() + 60,
            'used' => false,
            'status' => 'active',
            'created_by' => $input['email'] ?? 'unknown'
        ];
        
        $sessions[] = $session;
        file_put_contents($file, json_encode($sessions, JSON_PRETTY_PRINT));
        
        echo json_encode(['success'=>true, 'session'=>$session]);
        break;
        
    case 'validate':
        // Validate QR session
        if (!isset($input['session_id']) || !isset($input['token'])) {
            echo json_encode(['success'=>false, 'error'=>'Invalid QR Format', 'message'=>'Missing session_id or token']);
            break;
        }
        
        $sessionId = $input['session_id'];
        $token = $input['token'];
        $now = time();
        
        $session = null;
        foreach ($sessions as $s) {
            if ($s['session_id'] === $sessionId) {
                $session = $s;
                break;
            }
        }
        
        // Validation checks
        if (!$session) {
            echo json_encode(['success'=>false, 'error'=>'Session Not Found', 'message'=>'Invalid session ID']);
            break;
        }
        
        if ($session['token'] !== $token) {
            echo json_encode(['success'=>false, 'error'=>'Invalid QR Code', 'message'=>'Token mismatch']);
            break;
        }
        
        if ($session['status'] === 'expired' || $session['expiry_timestamp'] < $now) {
            echo json_encode(['success'=>false, 'error'=>'QR Code Expired', 'message'=>'QR code has expired']);
            break;
        }
        
        if ($session['used']) {
            echo json_encode(['success'=>false, 'error'=>'QR Code Already Used', 'message'=>'QR code already used']);
            break;
        }
        
        if ($session['status'] !== 'active') {
            echo json_encode(['success'=>false, 'error'=>'Invalid QR Code', 'message'=>'QR code is not active']);
            break;
        }
        
        // Mark session as used
        foreach ($sessions as &$s) {
            if ($s['session_id'] === $sessionId) {
                $s['used'] = true;
                $s['status'] = 'closed';
                $s['used_at'] = date('c');
                $s['used_timestamp'] = time();
                break;
            }
        }
        
        file_put_contents($file, json_encode($sessions, JSON_PRETTY_PRINT));
        
        echo json_encode(['success'=>true, 'message'=>'QR verified successfully', 'session'=>$session]);
        break;
        
    case 'get':
        // Get all sessions or filter by email
        $email = $input['email'] ?? null;
        if ($email) {
            $userSessions = array_filter($sessions, fn($s) => ($s['created_by'] ?? null) === $email);
            echo json_encode(['success'=>true, 'sessions'=>array_values($userSessions)]);
        } else {
            echo json_encode(['success'=>true, 'sessions'=>$sessions]);
        }
        break;
        
    case 'cleanup':
        // Remove expired sessions (optional cleanup)
        $now = time();
        $sessions = array_filter($sessions, fn($s) => $s['expiry_timestamp'] > $now || $s['used']);
        file_put_contents($file, json_encode($sessions, JSON_PRETTY_PRINT));
        
        echo json_encode(['success'=>true, 'message'=>'Cleanup completed']);
        break;
        
    default:
        echo json_encode(['success'=>false, 'message'=>'Unknown action']);
}

?>
