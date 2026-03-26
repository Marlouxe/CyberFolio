<?php
	// Connexion à MySQL
		$host = "localhost";
		$user = "root";
		$pass = ""; 
		$dbname = "cyberfolio";

		$conn = new mysqli($host, $user, $pass, $dbname);

		if ($conn->connect_error) {
    		die("Erreur de connexion : " . $conn->connect_error);
		}


	// ---- SUPPRESSION ----
		if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["delete"])) {

    	$id = intval($_POST["id"]);
    	$conn->query("DELETE FROM avis WHERE id = $id");

    	header("Location: cyberfolio_marilou.php#avis");
    	exit;
		}



	// ---- INSERTION ----
		if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["nom"])) {

    	$nom = $conn->real_escape_string($_POST["nom"]);
    	$note = intval($_POST["note"]);
    	$message = $conn->real_escape_string($_POST["message"]);

    	$conn->query("INSERT INTO avis (nom, note, message) VALUES ('$nom', $note, '$message')");

    	header("Location: cyberfolio_marilou.php#avis");
    	exit;
		}

	// ---- INSERTION CONTACT ----
		if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["contact_nom"])) {

    	$nom = $conn->real_escape_string($_POST["contact_nom"]);
    	$email = $conn->real_escape_string($_POST["contact_email"]);
    	$message = $conn->real_escape_string($_POST["contact_message"]);

    	$conn->query("INSERT INTO contact (nom, email, message) VALUES ('$nom', '$email', '$message')");

    	header("Location: cyberfolio_marilou.php#contact");
    	exit;
		}
?>


<html lang="fr">

<!--  Lien CSS, Parametres et nom du site -->
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cyber Folio</title>
	<link rel="stylesheet" href="cssmarilou.css">
</head>

<!--  Interieur Site -->
<body>
	<!--  Entête -->
	<header>
	<h1>Mon Cyber Folio</h1>
		<!--  Sommaire cliquable -->
		<nav>
			<ul>
				<li><a href="#about">À propos</a></li>
				<li><a href="#skills">Compétences</a></li>
				<li><a href="#projects">Projets</a></li>
				<li><a href="#game">Petit jeu</a></li>
				<li><a href="#avis">Avis</a></li>
				<li><a href="galerie.php">Galerie</a></li>
				<li><a href="#contact">Contact</a></li>
			</ul>
		</nav>

		<div class="header-buttons">
    		<a href="../images/cv_marilou.pdf" download class="cv-button">Télécharger mon CV</a>
    		<button id="darkModeToggle" class="dark-button">🌙 Mode sombre</button>
		</div>

	</header>

	<!--  Section À propos -->
	<section id="about" class="section">
	<h2>À propos</h2>
		<div class="about-container">
			<img src="../images/photo_profil.jpg" alt="Photo de moi" class="profile-photo">
		<div class="about-text">
			<p>Bonjour ! Je m'appelle <strong>Marilou Sionneau</strong>, j’ai <strong>18 ans</strong> et je suis basée à <strong>Lyon</strong>.</p>
			<p>Je suis très créative : je fais du <strong>crochet</strong>, du <strong>tricot</strong> et plein d’autres créations manuelles et artistiques.</p>
			<p>Bienvenue sur mon cyber-folio !</p>
		</div>
		</div>
	</section>

	<!--  Section compétences -->
	<section id="skills" class="section">
	<h2>Compétences</h2>
		<ul class="skills-list">
			<li>HTML / CSS</li>
			<li>PHP / MySQL</li>
			<li>Cybersécurité</li>
			<li>Linux / Réseau</li>
			<li>Canva (version premium)</li>
		</ul>
	</section>

	<!--  Section Projets -->
	<section id="projects" class="section">
	<h2>Projets</h2>
		<div class="project">
			<h3>Projet Réseau</h3>
			<p>J’ai conçu et déployé l’infrastructure réseau complète d’une entreprise, incluant la configuration des serveurs, des postes clients, du pare-feu et du routage. J’ai mis en place un système sécurisé avec gestion des droits, accès distant via VPN, et supervision du réseau. Le projet a été réalisé de A à Z, de l’analyse des besoins à la documentation finale</p>
		</div>
		<div class="project">
			<h3>Projet création site web</h3>
			<p>J’ai réalisé des sites web professionnels pour des entreprises, de la conception à la mise en ligne. J’ai géré l’architecture front-end et back-end, intégré des fonctionnalités sur mesure (formulaires, espace client, SEO), et assuré l’hébergement ainsi que la sécurité. Chaque projet a été adapté aux besoins spécifiques du client.</p>
		</div>
	</section>

	<!--  Section Petit Jeu -->
	<section id="game" class="section">
		<h2>Petit jeu</h2>
		<!--  Début code php pour le jeu -->
		<?php
		$resultat = "";

			if (isset($_POST['choix'])) {
   		$joueur = $_POST['choix'];

    
    	$options = ["pierre", "feuille", "ciseaux"];
    	$serveur = $options[array_rand($options)];

    
    		if ($joueur === $serveur) {
        $resultat = "Égalité ! Vous avez tous les deux choisi $joueur.";
    		} elseif (
        	($joueur === "pierre" && $serveur === "ciseaux") ||
        	($joueur === "feuille" && $serveur === "pierre") ||
        	($joueur === "ciseaux" && $serveur === "feuille")
    		) {
        $resultat = "Gagné ! Vous : $joueur | Serveur : $serveur.";
    		} else {
        $resultat = "Perdu... Vous : $joueur | Serveur : $serveur.";
   		}
		}?>

		<!--  Affichage choix Pierre, feuille, ciseaux -->
		<h2>Pierre - Feuille - Ciseaux</h2>

			<form method="POST" action="#game">
   				<button type="submit" name="choix" value="pierre">Pierre</button>
    			<button type="submit" name="choix" value="feuille">Feuille</button>
    			<button type="submit" name="choix" value="ciseaux">Ciseaux</button>
			</form>

		<!--  Affichage résultat -->
		<p>
    		<?php 
    			if ($resultat !== "") {
      	  		echo $resultat;
    			}
    		?>
		</p>
	</section>

	<!--  Section d'avis -->
	<section id="avis" class="section">
	<h2>Avis</h2>
		<form method="POST" action="">
			<input type="text" name="nom" placeholder="Votre nom" required>

			<select name="note" required>
				<option value="" disabled selected>Votre note</option>
				<option value="1">⭐ 1</option>
				<option value="2">⭐⭐ 2</option>
				<option value="3">⭐⭐⭐ 3</option>
				<option value="4">⭐⭐⭐⭐ 4</option>
				<option value="5">⭐⭐⭐⭐⭐ 5</option>
			</select>

			<textarea name="message" placeholder="Votre avis" required></textarea>
			<button type="submit">Envoyer</button>
		</form>

	<?php
		$result = $conn->query("SELECT * FROM avis ORDER BY date_avis DESC");

			while ($row = $result->fetch_assoc()) {
   				echo "<div class='avis-box'>";
    			echo "<strong>" . htmlspecialchars($row['nom']) . "</strong>";
    			echo " - ⭐" . $row['note'] . "<br>";
    			echo "<p>" . nl2br(htmlspecialchars($row['message'])) . "</p>";
    			echo "<small>" . $row['date_avis'] . "</small><br><br>";

    	// Formulaire de suppression
    			echo "<form method='POST' action='' onsubmit=\"return confirm('Supprimer cet avis ?');\">";
    			echo "<input type='hidden' name='id' value='" . $row['id'] . "'>";
    			echo "<input type='hidden' name='delete' value='1'>";
    			echo "<button type='submit' class='delete-btn'>Supprimer</button>";
    			echo "</form>";

    			echo "</div><hr>";
			}
	?>
	</section>
	
			<!-- SECTION CONTACT -->
	<section id="contact" class="section">
	<h2>Contact</h2>
		<form method="POST" action="">
    		<input type="text" name="contact_nom" placeholder="Votre nom" required>
    		<input type="email" name="contact_email" placeholder="Votre email" required>
    		<textarea name="contact_message" placeholder="Votre message" required></textarea>
    		<button type="submit">Envoyer</button>
		</form>
	</section>

	<script>
   		const toggle = document.getElementById("darkModeToggle");
    	toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    	});
	</script>

	<a href="admin_login.php" class="admin-btn">🔒</a>
</body>
</html>
