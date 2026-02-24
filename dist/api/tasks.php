<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : (isset($_GET['action'])?$_GET['action']:null);
$email = isset($input['email']) ? $input['email'] : (isset($_GET['email'])?$_GET['email']:null);
$title = isset($input['title']) ? $input['title'] : null;
$idx = isset($input['idx']) ? intval($input['idx']) : null;
$completed = isset($input['completed']) ? boolval($input['completed']) : null;

$file = __DIR__ . '/../data/tasks.json';
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
        $userTasks = isset($data[$email]) ? $data[$email] : [];
        echo json_encode(['success'=>true,'data'=>$userTasks]);
        break;
    case 'add':
        if (!$email || !$title) { echo json_encode(['success'=>false,'message'=>'Missing params']); break; }
        if (!isset($data[$email])) $data[$email] = [];
        $entry = ['title'=>$title,'completed'=>false,'deadline'=>isset($input['deadline'])?$input['deadline']:'','createdAt'=>time()];
        array_unshift($data[$email], $entry);
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true,'data'=>$entry]);
        break;
    case 'toggle':
        if (!$email || $idx === null) { echo json_encode(['success'=>false,'message'=>'Missing params']); break; }
        if (!isset($data[$email]) || !isset($data[$email][$idx])) { echo json_encode(['success'=>false,'message'=>'Index not found']); break; }
        $data[$email][$idx]['completed'] = !$data[$email][$idx]['completed'];
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true,'data'=>$data[$email][$idx]]);
        break;
    case 'delete':
        if (!$email || $idx === null) { echo json_encode(['success'=>false,'message'=>'Missing params']); break; }
        if (!isset($data[$email]) || !isset($data[$email][$idx])) { echo json_encode(['success'=>false,'message'=>'Index not found']); break; }
        array_splice($data[$email], $idx, 1);
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['success'=>true]);
        break;
    default:
        echo json_encode(['success'=>false,'message'=>'Unknown action']);
}

?>