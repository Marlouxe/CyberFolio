<?php
session_start();
?>

<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion Admin</title>
    <link rel="stylesheet" href="cssmarilou.css">
</head>

<body>
    <!-- Form de connexion -->
    <section id="login" class="section">
        <h2>Connexion Administrateur</h2>

        <form method="POST" action="admin_check.php">
            <input type="text" name="login" placeholder="Identifiant" required>
            <input type="password" name="password" placeholder="Mot de passe" required>
            <button type="submit">Se connecter</button>
        </form>

    </section>

</body>
</html>
