<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "film_review_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Ambil statistik
$stats = [
    'total_reviews' => 0,
    'my_reviews' => 0,
    'community_reviews' => 0
];

$result = $conn->query("SELECT 
    COUNT(*) AS total_reviews,
    SUM(is_mine) AS my_reviews,
    SUM(NOT is_mine) AS community_reviews 
    FROM reviews");
    
if ($result && $result->num_rows > 0) {
    $stats = $result->fetch_assoc();
}

echo json_encode($stats);

$conn->close();
?>