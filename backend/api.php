<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "film_review_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// GET all reviews
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM reviews";
    $result = $conn->query($sql);
    
    $reviews = array();
    while($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
    echo json_encode($reviews);
}

// POST new review
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $stmt = $conn->prepare("INSERT INTO reviews (title, reviewer, avatar, quote, rating, date, poster, mood, is_mine, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssisssii", 
        $data['title'],
        $data['reviewer'],
        $data['avatar'],
        $data['quote'],
        $data['rating'],
        $data['date'],
        $data['poster'],
        $data['mood'],
        $data['is_mine'],
        $data['likes']
    );
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Review added successfully"]);
    } else {
        echo json_encode(["error" => "Error adding review"]);
    }
}

// DELETE review
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    
    $stmt = $conn->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Review deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error deleting review"]);
    }
}

// UPDATE review (like)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Update like count
    if (isset($data['id']) && isset($data['likes'])) {
        $stmt = $conn->prepare("UPDATE reviews SET likes = ? WHERE id = ?");
        $stmt->bind_param("ii", $data['likes'], $data['id']);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Like updated successfully"]);
        } else {
            echo json_encode(["error" => "Error updating like"]);
        }
    }
    // Update full review
    else {
        $stmt = $conn->prepare("UPDATE reviews SET title=?, reviewer=?, avatar=?, quote=?, rating=?, date=?, poster=?, mood=?, is_mine=?, likes=? WHERE id=?");
        $stmt->bind_param("ssssisssiii", 
            $data['title'],
            $data['reviewer'],
            $data['avatar'],
            $data['quote'],
            $data['rating'],
            $data['date'],
            $data['poster'],
            $data['mood'],
            $data['is_mine'],
            $data['likes'],
            $data['id']
        );
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Review updated successfully"]);
        } else {
            echo json_encode(["error" => "Error updating review"]);
        }
    }
}

$conn->close();
?>