
<?php
session_start();

$login = $_POST["login"];
$password = $_POST["password"];

// Identifiant fixe (peut être stocké dans MySQL si tu veux)
$correctLogin = "Admin";

// Mot de passe hashé généré par password_hash() 
$hash = '$2y$10$PXFAiw1ulU9goyymkiuGdOTB/ju/DEZQJ13OCCDw9trVjqePgo8hO'; 

    if ($login === $correctLogin && password_verify($password, $hash)) {
        $_SESSION["admin"] = true;

        // Connexion MySQL
        $host = "localhost";
        $user = "root";
        $pass = ""; 
        $dbname = "cyberfolio";

        $conn = new mysqli($host, $user, $pass, $dbname);

    if ($conn->connect_error) {
        die("Erreur : Connexion échouée " . $conn->connect_error);
    }
        $loginUsed = $conn->real_escape_string($login);
        $conn->query("INSERT INTO admin_logs (pseudo) VALUES ('$loginUsed')");

        header("Location: admin_page.php");
        exit;
    } else {
        die("Accès refusé !");
    }
?>
