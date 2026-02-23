<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : (isset($_GET['action'])?$_GET['action']:null);
$email = isset($input['email']) ? $input['email'] : (isset($_GET['email'])?$_GET['email']:null);
$title = isset($input['title']) ? $input['title'] : null;
$description = isset($input['description']) ? $input['description'] : null;

$file = __DIR__ . '/../data/reports.json';
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
        $userReports = isset($data[$email]) ? $data[$email] : [];
        echo json_encode(['success'=>true,'data'=>$userReports]);
        break;
    case 'submit':
        if (!$email || !$title || !$description) { echo json_encode(['success'=>false,'message'=>'Missing params']); break; }
        if (!isset($data[$email])) $data[$email] = [];
        $now = date('H:i:s');
        $entry = ['title'=>$title,'description'=>$description,'time'=>$now,'timestamp'=>time()];
        array_unshift($data[$email], $entry);
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true,'data'=>$entry]);
        break;
    default:
        echo json_encode(['success'=>false,'message'=>'Unknown action']);
}

?>