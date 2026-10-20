const roles = {
  client: { name: "Client", level: 0 },
  vip: { name: "VIP", level: 1 },
  technicien: { name: "Technicien", level: 2 },
  admin: { name: "Administrateur", level: 3 },
  dev: { name: "Développeur", level: 4 }
};

const accounts = {
  cli: { password: "1313", role: "client" },
  vip: { password: "1313", role: "vip" },
  tech: { password: "1313", role: "technicien" },
  admin: { password: "1111", role: "admin" },
  dev: { password: "1212", role: "dev" }
};

const menuItems = [
  { label: "Accueil de l’espace", file: "espace.html", role: "client" },
  { label: "Créer un verre", file: "creer-verre.html", role: "client" },
  { label: "Verres enregistrés", file: "verres-enregistres.html", role: "vip" },
  { label: "Boissons souhaitées", file: "boissons.html", role: "technicien" },
  { label: "Statistiques", file: "statistiques.html", role: "admin" },
  { label: "Annonces", file: "annonces.html", role: "admin" },
  { label: "Journaux des actions", file: "logs.html", role: "dev" }
];

function getData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getUser() {
  return JSON.parse(sessionStorage.getItem("projectUser") || "null");
}

function addLog(action) {
  const user = getUser();
  const logs = getData("projectLogs");

  logs.unshift({
    action,
    user: user ? user.username : "visiteur",
    date: new Date().toLocaleString("fr-FR")
  });

  saveData("projectLogs", logs);
}

function hasRole(userRole, requiredRole) {
  return roles[userRole].level >= roles[requiredRole].level;
}

function showList(element, items, emptyText, getContent) {
  if (!element) return;

  element.innerHTML = "";

  if (items.length === 0) {
    element.innerHTML = `<p class="empty-message">${emptyText}</p>`;
    return;
  }

  items.forEach(function (item) {
    const row = document.createElement("article");
    row.className = "list-item";
    row.innerHTML = getContent(item);
    element.appendChild(row);
  });
}

function setupLogin() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.querySelector("#username").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;
    const account = accounts[username];

    if (!account || account.password !== password) {
      document.querySelector("#login-error").textContent =
        "Identifiant ou mot de passe incorrect.";
      return;
    }

    const user = { username, role: account.role };
    sessionStorage.setItem("projectUser", JSON.stringify(user));
    addLog("Connexion");
    window.location.href = "espace.html";
  });
}

function setupProtectedPage() {
  const requiredRole = document.body.dataset.role;
  if (!requiredRole) return;

  const user = getUser();

  if (!user) {
    window.location.href = "connexion.html";
    return;
  }

  if (!hasRole(user.role, requiredRole)) {
    alert("Tu n’as pas le grade nécessaire pour accéder à cette page.");
    window.location.href = "espace.html";
    return;
  }

  const label = document.querySelector("#user-label");
  if (label) {
    label.textContent = `${user.username} · ${roles[user.role].name}`;
  }

  const sidebar = document.querySelector("#sidebar-nav");
  if (sidebar) {
    const currentPage = window.location.pathname.split("/").pop();

    menuItems
      .filter(item => hasRole(user.role, item.role))
      .forEach(function (item) {
        const link = document.createElement("a");
        link.href = item.file;
        link.textContent = item.label;

        if (item.file === currentPage) {
          link.classList.add("active");
        }

        sidebar.appendChild(link);
      });
  }

  const logout = document.querySelector("#logout-link");
  if (logout) {
    logout.addEventListener("click", function (event) {
      event.preventDefault();
      addLog("Déconnexion");
      sessionStorage.removeItem("projectUser");
      window.location.href = "index.html";
    });
  }

  const gradeInfo = document.querySelector("#grade-info");
  if (gradeInfo) {
    gradeInfo.textContent = roles[user.role].name;
  }
}

function setupGlassForm() {
  const form = document.querySelector("#glass-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const user = getUser();
    const glasses = getData("projectGlasses");

    glasses.unshift({
      id: Date.now(),
      name: document.querySelector("#glass-name").value.trim(),
      volume: document.querySelector("#glass-volume").value,
      saved: false,
      createdBy: user.username,
      date: new Date().toLocaleString("fr-FR")
    });

    saveData("projectGlasses", glasses);
    addLog("Création d’un verre");
    form.reset();
    renderGlasses();
  });

  renderGlasses();
}

function renderGlasses() {
  const list = document.querySelector("#glass-list");
  if (!list) return;

  const user = getUser();
  const glasses = getData("projectGlasses");

  list.innerHTML = "";

  if (glasses.length === 0) {
    list.innerHTML = '<p class="empty-message">Aucun verre créé pour le moment.</p>';
    return;
  }

  glasses.forEach(function (glass) {
    const item = document.createElement("article");
    item.className = "list-item";

    const details = document.createElement("div");
    details.innerHTML =
      `<strong>${glass.name}</strong><p>${glass.volume} ml · créé par ${glass.createdBy}</p>`;

    item.appendChild(details);

    if (!glass.saved && hasRole(user.role, "vip")) {
      const button = document.createElement("button");
      button.className = "small-button";
      button.textContent = "Enregistrer";
      button.addEventListener("click", function () {
        const updated = getData("projectGlasses");
        const selected = updated.find(entry => entry.id === glass.id);
        selected.saved = true;
        saveData("projectGlasses", updated);
        addLog("Enregistrement d’un verre");
        renderGlasses();
      });
      item.appendChild(button);
    } else if (glass.saved) {
      const savedLabel = document.createElement("span");
      savedLabel.textContent = "Enregistré";
      item.appendChild(savedLabel);
    }

    list.appendChild(item);
  });
}

function setupSavedGlasses() {
  const list = document.querySelector("#saved-glass-list");
  if (!list) return;

  const glasses = getData("projectGlasses").filter(glass => glass.saved);

  showList(
    list,
    glasses,
    "Aucun verre enregistré.",
    glass => `<div><strong>${glass.name}</strong><p>${glass.volume} ml</p></div>`
  );
}

function setupDrinkForm() {
  const form = document.querySelector("#drink-form");
  const list = document.querySelector("#drink-list");
  if (!form || !list) return;

  function renderDrinks() {
    const drinks = getData("projectDrinks");
    showList(
      list,
      drinks,
      "Aucune boisson ajoutée.",
      drink => `<div><strong>${drink.name}</strong><p>Ajoutée par ${drink.createdBy}</p></div>`
    );
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const drinks = getData("projectDrinks");
    const user = getUser();

    drinks.unshift({
      name: document.querySelector("#drink-name").value.trim(),
      createdBy: user.username
    });

    saveData("projectDrinks", drinks);
    addLog("Ajout d’une boisson souhaitée");
    form.reset();
    renderDrinks();
  });

  renderDrinks();
}

function setupAnnouncements() {
  const form = document.querySelector("#announcement-form");
  const list = document.querySelector("#announcement-list");

  if (form && list) {
    function renderAdminAnnouncements() {
      const announcements = getData("projectAnnouncements");
      showList(
        list,
        announcements,
        "Aucune annonce publiée.",
        announcement =>
          `<div><strong>${announcement.title}</strong><p>${announcement.text}</p><p>${announcement.date}</p></div>`
      );
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const announcements = getData("projectAnnouncements");
      const user = getUser();

      announcements.unshift({
        title: document.querySelector("#announcement-title").value.trim(),
        text: document.querySelector("#announcement-text").value.trim(),
        date: new Date().toLocaleString("fr-FR"),
        createdBy: user.username
      });

      saveData("projectAnnouncements", announcements);
      addLog("Publication d’une annonce");
      form.reset();
      renderAdminAnnouncements();
    });

    renderAdminAnnouncements();
  }

  const homeList = document.querySelector("#annonces-accueil");
  if (homeList) {
    const announcements = getData("projectAnnouncements");
    showList(
      homeList,
      announcements,
      "Aucune annonce pour le moment.",
      announcement =>
        `<div><strong>${announcement.title}</strong><p>${announcement.text}</p><p>${announcement.date}</p></div>`
    );
  }
}

function setupStatistics() {
  if (!document.querySelector("#stat-glasses")) return;

  const glasses = getData("projectGlasses");
  const drinks = getData("projectDrinks");
  const announcements = getData("projectAnnouncements");

  document.querySelector("#stat-glasses").textContent = glasses.length;
  document.querySelector("#stat-saved").textContent =
    glasses.filter(glass => glass.saved).length;
  document.querySelector("#stat-drinks").textContent = drinks.length;
  document.querySelector("#stat-announcements").textContent = announcements.length;
}

function setupLogs() {
  const list = document.querySelector("#log-list");
  if (!list) return;

  const logs = getData("projectLogs");
  showList(
    list,
    logs,
    "Aucune action enregistrée.",
    log => `<div><strong>${log.action}</strong><p>${log.user} · ${log.date}</p></div>`
  );
}

document.addEventListener("DOMContentLoaded", function () {
  setupLogin();
  setupProtectedPage();
  setupGlassForm();
  setupSavedGlasses();
  setupDrinkForm();
  setupAnnouncements();
  setupStatistics();
  setupLogs();
});