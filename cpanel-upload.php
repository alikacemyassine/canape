<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ⚠️ IMPORTANT: Set your secret password here to match Vercel's UPLOAD_SECRET
$EXPECTED_SECRET = '7+zA:1(67ao@z6Ki:z';

// ⚠️ IMPORTANT: Set your cPanel domain or subdomain here (must end with a slash /)
// For example: 'https://cdn.canape-algerie.com/' or 'http://65.21.166.135/~yourusername/'
$BASE_URL = 'http://65.21.166.135/~lecanape/';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

if (!isset($data['secret']) || $data['secret'] !== $EXPECTED_SECRET) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: Invalid secret']);
    exit;
}

if (!isset($data['dataUrl']) || !isset($data['fileName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing dataUrl or fileName']);
    exit;
}

// Extract base64 from data URL (e.g. "data:image/jpeg;base64,/9j/4AA...")
$parts = explode(',', $data['dataUrl']);
if (count($parts) !== 2) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid dataUrl format']);
    exit;
}

$base64Data = $parts[1];
$fileData = base64_decode($base64Data);

if ($fileData === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Failed to decode base64']);
    exit;
}

// We assume this file is placed in public_html/api/upload.php
// We will save images to public_html/images/
$targetDir = __DIR__ . '/../images/';

// Create images directory if it doesn't exist
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// Secure the filename (allow only letters, numbers, hyphens, dots)
$fileName = preg_replace('/[^a-zA-Z0-9.-]/', '-', $data['fileName']);
$targetPath = $targetDir . $fileName;

if (file_put_contents($targetPath, $fileData) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file to disk']);
    exit;
}

$publicUrl = $BASE_URL . 'images/' . $fileName;

http_response_code(201);
echo json_encode([
    'url' => $publicUrl,
    'pathname' => 'images/' . $fileName
]);
exit;
