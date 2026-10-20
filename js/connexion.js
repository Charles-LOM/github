const formulaire = document.querySelector("#form-connexion");
const zoneErreur = document.querySelector("#erreur");
const zoneFormulaire = document.querySelector("#formulaire");
const espace = document.querySelector("#espace");
const boutonDeconnexion = document.querySelector("#deconnexion");

formulaire.addEventListener("submit", function (event) {
  event.preventDefault();

  const identifiant = document.querySelector("#identifiant").value;
  const motDePasse = document.querySelector("#mot-de-passe").value;

  if (identifiant === "dev" && motDePasse === "1212") {
    zoneFormulaire.classList.add("cache");
    espace.classList.remove("cache");
  } else {
    zoneErreur.textContent = "Identifiant ou mot de passe incorrect.";
  }
});

boutonDeconnexion.addEventListener("click", function () {
  espace.classList.add("cache");
  zoneFormulaire.classList.remove("cache");
  formulaire.reset();
  zoneErreur.textContent = "";
});