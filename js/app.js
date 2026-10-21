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

const defaultAccountProfiles = [
  { username: "cli", name: "Compte Client", email: "client@example.test", phone: "+33 6 00 00 00 01", created: "2026-09-12", role: "client" },
  { username: "vip", name: "Compte VIP", email: "vip@example.test", phone: "+33 6 00 00 00 02", created: "2026-09-18", role: "vip" },
  { username: "tech", name: "Compte Technicien", email: "technicien@example.test", phone: "+33 6 00 00 00 03", created: "2026-10-02", role: "technicien" },
  { username: "admin", name: "Compte Administrateur", email: "admin@example.test", phone: "+33 6 00 00 00 04", created: "2026-10-05", role: "admin" },
  { username: "dev", name: "Compte Développeur", email: "developpeur@example.test", phone: "+33 6 00 00 00 05", created: "2026-10-06", role: "dev" }
];

function loadAccountProfiles() {
  const saved = getData("projectAccounts");

  return defaultAccountProfiles.map(profile => {
    const updated = saved.find(item => item.username === profile.username);

    return updated && roles[updated.role]
      ? { ...profile, role: updated.role }
      : { ...profile };
  });
}

let accountProfiles = loadAccountProfiles();

const ingredients = [
  { id: "goutte1", name: "Goutte 1", color: "#e21b23" },
  { id: "goutte2", name: "Goutte 2", color: "#e89c30" },
  { id: "goutte3", name: "Goutte 3", color: "#e6ce44" },
  { id: "goutte4", name: "Goutte 4", color: "#6ca85b" },
  { id: "goutte5", name: "Goutte 5", color: "#4d91c7" },
  { id: "goutte6", name: "Goutte 6", color: "#945aa5" },
  { id: "eau", name: "Eau", color: "#54bce8" }
];

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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
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
  return Boolean(
    roles[userRole] &&
    roles[requiredRole] &&
    roles[userRole].level >= roles[requiredRole].level
  );
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
    const profile = accountProfiles.find(item => item.username === username);

    if (!account || account.password !== password) {
      document.querySelector("#login-error").textContent =
        "Identifiant ou mot de passe incorrect.";
      return;
    }

    const user = {
      username,
      role: profile ? profile.role : account.role
    };

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

function calculateMillilitres(mix, volume) {
  const amounts = ingredients.map(item => ({
    id: item.id,
    exact: volume * Number(mix[item.id] || 0) / 100
  }));

  const result = {};
  amounts.forEach(item => {
    result[item.id] = Math.floor(item.exact);
  });

  let remaining = volume - Object.values(result)
    .reduce((sum, amount) => sum + amount, 0);

  amounts.sort((a, b) => (b.exact % 1) - (a.exact % 1));

  for (let index = 0; remaining > 0; index++, remaining--) {
    result[amounts[index % amounts.length].id]++;
  }

  return result;
}

function renderMix(mix, volume) {
  const millilitres = calculateMillilitres(mix, volume);

  ingredients.forEach(function (ingredient) {
    const slider = document.querySelector(
      '[data-ingredient="' + ingredient.id + '"]'
    );
    const output = document.querySelector('#amount-' + ingredient.id);

    if (slider) slider.value = mix[ingredient.id] || 0;
    if (output) {
      output.textContent =
        (mix[ingredient.id] || 0) + '% · ' +
        millilitres[ingredient.id] + ' ml';
    }
  });

  const glass = document.querySelector('#glass-preview');

  if (glass) {
    glass.innerHTML = ingredients.map(ingredient =>
      '<div class="glass-segment" style="height:' +
      mix[ingredient.id] +
      '%;background:' +
      ingredient.color +
      '" title="' +
      ingredient.name +
      ' : ' +
      mix[ingredient.id] +
      '%">' +
      (mix[ingredient.id] >= 14
        ? ingredient.name + ' ' + mix[ingredient.id] + '%'
        : '') +
      '</div>'
    ).join('');

    glass.setAttribute('aria-label', 'Verre rempli à 100 pour cent');
  }

  const total = document.querySelector('#mix-total');
  if (total) {
    total.textContent = 'Total : 100 % · ' + volume + ' ml';
  }
}

function redistributeMix(mix, changedId, value) {
  const target = Math.max(0, Math.min(100, Math.round(Number(value))));
  mix[changedId] = target;

  const otherIds = ingredients
    .map(item => item.id)
    .filter(id => id !== changedId);

  const remaining = 100 - target;
  const weights = otherIds.map(id => Math.max(0, Number(mix[id] || 0)));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let assigned = 0;

  otherIds.forEach(function (id, index) {
    const next = index === otherIds.length - 1
      ? remaining - assigned
      : totalWeight
        ? Math.floor(remaining * weights[index] / totalWeight)
        : Math.floor(remaining / otherIds.length);

    mix[id] = next;
    assigned += next;
  });
}

function setupGlassForm() {
  const form = document.querySelector('#glass-form');
  if (!form) return;

  const volumeInput = document.querySelector('#glass-volume');
  const nameInput = document.querySelector('#glass-name');

  const defaultMix = {
    goutte1: 0,
    goutte2: 0,
    goutte3: 0,
    goutte4: 0,
    goutte5: 0,
    goutte6: 0,
    eau: 100
  };

  const recipes = {
    jardin: {
      name: 'Le Jardin frais',
      volume: 250,
      mix: {
        goutte1: 0, goutte2: 0, goutte3: 0,
        goutte4: 20, goutte5: 10, goutte6: 0, eau: 70
      }
    },
    douceur: {
      name: 'Rouge douceur',
      volume: 200,
      mix: {
        goutte1: 20, goutte2: 0, goutte3: 0,
        goutte4: 0, goutte5: 0, goutte6: 10, eau: 70
      }
    },
    agrumes: {
      name: 'Agrumes pétillants',
      volume: 300,
      mix: {
        goutte1: 15, goutte2: 15, goutte3: 0,
        goutte4: 0, goutte5: 0, goutte6: 0, eau: 70
      }
    }
  };

  const recipe = recipes[
    new URLSearchParams(window.location.search).get('recette')
  ];

  let mix = recipe ? { ...recipe.mix } : { ...defaultMix };

  if (recipe) {
    nameInput.value = recipe.name;
    volumeInput.value = recipe.volume;
  }

  ingredients.forEach(function (ingredient) {
    const slider = document.querySelector(
      '[data-ingredient="' + ingredient.id + '"]'
    );

    if (slider) {
      slider.addEventListener('input', function () {
        redistributeMix(mix, ingredient.id, slider.value);
        renderMix(mix, Number(volumeInput.value) || 250);
      });
    }
  });

  volumeInput.addEventListener('change', function () {
    const volume = Math.max(
      100,
      Math.min(1000, Number(volumeInput.value) || 100)
    );

    volumeInput.value = volume;
    renderMix(mix, volume);
  });

  renderMix(mix, Number(volumeInput.value) || 250);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const user = getUser();
    const volume = Math.max(
      100,
      Math.min(1000, Number(volumeInput.value) || 0)
    );

    if (!user || volume < 100) return;

    const glasses = getData('projectGlasses');

    glasses.unshift({
      id: Date.now(),
      name: nameInput.value.trim(),
      volume,
      mix: { ...mix },
      saved: false,
      createdBy: user.username,
      date: new Date().toLocaleString('fr-FR')
    });

    saveData('projectGlasses', glasses);
    addLog('Création d’un verre');

    form.reset();
    mix = { ...defaultMix };
    volumeInput.value = 250;
    renderMix(mix, 250);
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
    const recipe = glass.mix
      ? formatMix(glass.mix, glass.volume)
      : '';

    details.innerHTML =
      `<strong>${escapeHTML(glass.name)}</strong>` +
      `<p>${glass.volume} ml · créé par ${escapeHTML(glass.createdBy)}` +
      `${recipe ? '<br>' + escapeHTML(recipe) : ''}</p>`;

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

function formatMix(mix, volume) {
  const millilitres = calculateMillilitres(mix, volume);

  return ingredients
    .filter(item => Number(mix[item.id]) > 0)
    .map(item =>
      item.name + ' ' + mix[item.id] + '% (' +
      millilitres[item.id] + ' ml)'
    )
    .join(', ');
}

function setupAccountManagement() {
  const list = document.querySelector('#account-list');
  if (!list) return;

  const user = getUser();

  if (!user || !hasRole(user.role, 'admin')) {
    window.location.href = 'espace.html';
    return;
  }

  function renderAccounts() {
    list.innerHTML = '';

    accountProfiles.forEach(function (account) {
      const row = document.createElement('tr');

      row.innerHTML =
        '<td>' + escapeHTML(account.name) +
        ' <small>(' + escapeHTML(account.username) + ')</small></td>' +
        '<td>' +
        new Date(account.created + 'T12:00:00').toLocaleDateString('fr-FR') +
        '</td>' +
        '<td><a href="mailto:' + escapeHTML(account.email) + '">' +
        escapeHTML(account.email) + '</a></td>' +
        '<td>' + escapeHTML(account.phone) + '</td>' +
        '<td><select aria-label="Grade de ' +
        escapeHTML(account.name) +
        '" data-account-role="' + escapeHTML(account.username) + '">' +
        Object.entries(roles)
          .map(([key, role]) =>
            '<option value="' + key + '"' +
            (account.role === key ? ' selected' : '') +
            '>' + escapeHTML(role.name) + '</option>'
          )
          .join('') +
        '</select></td>';

      list.appendChild(row);
    });
  }

  list.addEventListener('change', function (event) {
    const select = event.target.closest('[data-account-role]');
    if (!select) return;

    const account = accountProfiles.find(
      item => item.username === select.dataset.accountRole
    );

    if (!account) return;

    account.role = select.value;

    saveData(
      'projectAccounts',
      accountProfiles.map(item => ({
        username: item.username,
        role: item.role
      }))
    );

    addLog('Modification du grade de ' + account.username);
    renderAccounts();
  });

  renderAccounts();
}

function setupSavedGlasses() {
  const list = document.querySelector("#saved-glass-list");
  if (!list) return;

  const glasses = getData("projectGlasses")
    .filter(glass => glass.saved);

  showList(
    list,
    glasses,
    "Aucun verre enregistré.",
    glass =>
      `<div><strong>${glass.name}</strong><p>${glass.volume} ml</p></div>`
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
      drink =>
        `<div><strong>${drink.name}</strong>` +
        `<p>Ajoutée par ${drink.createdBy}</p></div>`
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
          `<div><strong>${announcement.title}</strong>` +
          `<p>${announcement.text}</p><p>${announcement.date}</p></div>`
      );
    }

    form.addEventListener('submit', function (event) {
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
        `<div><strong>${announcement.title}</strong>` +
        `<p>${announcement.text}</p><p>${announcement.date}</p></div>`
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
  document.querySelector("#stat-announcements").textContent =
    announcements.length;
}

function setupLogs() {
  const list = document.querySelector("#log-list");
  if (!list) return;

  const logs = getData("projectLogs");

  showList(
    list,
    logs,
    "Aucune action enregistrée.",
    log =>
      `<div><strong>${log.action}</strong>` +
      `<p>${log.user} · ${log.date}</p></div>`
  );
}

document.addEventListener("DOMContentLoaded", function () {
  setupLogin();
  setupProtectedPage();
  accountProfiles = loadAccountProfiles();
  setupGlassForm();
  setupSavedGlasses();
  setupAccountManagement();
  setupDrinkForm();
  setupAnnouncements();
  setupStatistics();
  setupLogs();
});