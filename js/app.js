// Fonction pour ouvrir/fermer le menu mobile
const openMenu = () => {
    // Sélectionne le menu en utilisant la classe 'header-menu'
    const menu = document.querySelector('.header-menu');

    // Alterne la classe 'active' pour afficher ou masquer le menu
    menu.classList.toggle("active");

    // Change l'icône du menu en fonction de son état (ouvert ou fermé)
    if (menu.classList.contains("active")) {
        // Si le menu est actif, affiche l'icône "close"
        document.querySelector("header .material-symbols-outlined").innerHTML = "close";
    } else {
        // Sinon, affiche l'icône "menu"
        document.querySelector("header .material-symbols-outlined").innerHTML = "menu";
    }
}

// Fonction de défilement personnalisée pour les liens du menu
document.querySelectorAll('.header-menu a').forEach(anchor => {
    // Ajoute un écouteur d'événement à chaque lien pour le clic
    anchor.addEventListener('click', function(e) {
        // Empêche le comportement de défilement par défaut du lien
        e.preventDefault();

        // Récupère l'ID de la section cible à partir du lien (sans le #)
        const targetId = this.getAttribute('href').substring(1);

        // Sélectionne l'élément correspondant à l'ID de la section cible
        const targetElement = document.getElementById(targetId);

        // Définit un décalage pour éviter que la section soit masquée par le menu
        const offset = -80; // Ajuste cette valeur selon la hauteur de ton menu

        // Calcule la position de la section par rapport au haut de la page
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;

        // Ajoute le décalage pour obtenir la position finale de défilement
        const offsetPosition = elementPosition + offset;

        // Fait défiler la fenêtre jusqu'à la position cible, avec un défilement fluide
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth' // Animation fluide pour le défilement
        });
    });
});
