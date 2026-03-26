<?php
session_start();
    if (!isset($_SESSION["admin"])) {
        header("Location: admin_login.php");
        exit;
    }
?>

<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Admin</title>
    <link rel="stylesheet" href="cssmarilou.css">
</head>

<body>
    <section class="section">
    <h2>Bienvenue sur la page Admin</h2>
    <p>Contenu réservé 🌸</p>

        <section class="section" style="display:flex; gap:30px;">

        <!-- Tableau CONTACT -->
        <div style="width:50%;">
        <h2>Contacts reçus</h2>
            <table border="1" cellpadding="6">
            <tr><th>Nom</th><th>Email</th><th>Message</th><th>Date</th></tr>

        <?php
        // Connexion MySQL
            $host = "localhost";
            $user = "root";
            $pass = ""; 
            $dbname = "cyberfolio";

            $conn = new mysqli($host, $user, $pass, $dbname);

                if ($conn->connect_error) {
                    die("Erreur : Connexion échouée " . $conn->connect_error);
                    }
                         $r = $conn->query("SELECT * FROM contact ORDER BY date_contact DESC");
                        while($row = $r->fetch_assoc()){
                        echo "<tr>";
                        echo "<td>".$row['nom']."</td>";
                        echo "<td>".$row['email']."</td>";
                        echo "<td>".$row['message']."</td>";
                        echo "<td>".$row['date_contact']."</td>";
                        echo "</tr>";
                        }
        ?>
            </table>
        </div>

        <!-- Tableau CONNEXION ADMIN -->
        <div style="width:50%;">
        <h2>Connexions admin</h2>
            <table border="1" cellpadding="6">
            <tr><th>Pseudo</th><th>Date connexion</th></tr>

            <?php
                $r2 = $conn->query("SELECT * FROM admin_logs ORDER BY date_login DESC");
                    while($row2 = $r2->fetch_assoc()){
                    echo "<tr>";
                    echo "<td>".$row2['pseudo']."</td>";
                    echo "<td>".$row2['date_login']."</td>";
                    echo "</tr>";
                    }
            ?>
            </table>
        </div>

        </section>
    </section>

</body>
</html>

