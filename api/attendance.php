<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : (isset($_GET['action'])?$_GET['action']:null);
$email = isset($input['email']) ? $input['email'] : (isset($_GET['email'])?$_GET['email']:null);
$date = isset($input['date']) ? $input['date'] : (isset($_GET['date'])?$_GET['date']:null);
$time = isset($input['time']) ? $input['time'] : (isset($_GET['time'])?$_GET['time']:null);
$method = isset($input['method']) ? $input['method'] : (isset($_GET['method'])?$_GET['method']:'Manual');
$timestamp = isset($input['timestamp']) ? $input['timestamp'] : date('c');

$file = __DIR__ . '/../data/attendance.json';
if (!file_exists(dirname($file))) { mkdir(dirname($file), 0755, true); }
if (!file_exists($file)) { file_put_contents($file, json_encode(new stdClass())); }

$data = json_decode(file_get_contents($file), true);
if (!is_array($data)) $data = [];

if (!$action) {
    echo json_encode(['success'=>false,'message'=>'No action provided']);
    exit;
}

switch ($action) {
    case 'get':
        $userData = isset($data[$email]) ? $data[$email] : [];
        echo json_encode(['success'=>true,'data'=>$userData]);
        break;
        
    case 'checkin':
        if (!$email || !$date || !$time) { 
            echo json_encode(['success'=>false,'message'=>'Missing params']); 
            break; 
        }
        if (!isset($data[$email])) $data[$email] = [];
        if (!isset($data[$email][$date])) $data[$email][$date] = [];
        $data[$email][$date]['checkIn'] = $time;
        $data[$email][$date]['method'] = $method;
        $data[$email][$date]['checkInTimestamp'] = $timestamp;
        $data[$email][$date]['status'] = 'checked-in';
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true,'data'=>$data[$email][$date]]);
        break;
        
    case 'checkout':
        if (!$email || !$date || !$time) { 
            echo json_encode(['success'=>false,'message'=>'Missing params']); 
            break; 
        }
        if (!isset($data[$email])) $data[$email] = [];
        if (!isset($data[$email][$date])) $data[$email][$date] = [];
        $data[$email][$date]['checkOut'] = $time;
        $data[$email][$date]['checkOutTimestamp'] = $timestamp;
        $data[$email][$date]['status'] = 'checked-out';
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true,'data'=>$data[$email][$date]]);
        break;
        
    default:
        echo json_encode(['success'=>false,'message'=>'Unknown action']);
}

?>
