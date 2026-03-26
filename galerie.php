<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galerie - Marilou</title>
    <link rel="stylesheet" href="cssmarilou.css">
</head>

<body>
    <header>
        <h1>Galerie Créative</h1>
            <nav>
                <ul>
                <li><a href="cyberfolio_marilou.php">Accueil</a></li>
                </ul>
            </nav>
    </header>

    <section class="section">
        <h2>Mes créations</h2>
        <div class="gallery-container">
            <img src="../images/img1.jpg" alt="Création 1">
            <img src="../images/img2.jpg" alt="Création 2">
            <img src="../images/img3.jpg" alt="Création 3">
            <img src="../images/img4.jpg" alt="Création 4">
            <img src="../images/img5.jpg" alt="Création 5">
            <img src="../images/img6.jpg" alt="Création 6">
        </div>
    </section>

    <script>
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) {
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
    }
    </script>
</body>
</html>


