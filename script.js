// --- DONNÉES INITIALES ---
let db = {
    livres: JSON.parse(localStorage.getItem('lib_livres')) || [
        { id: 1, titre: "Réseaux CISCO", auteur: "Jean Dupont", cat: "Réseau", annee: 2023 },
        { id: 2, titre: "JS Moderne", auteur: "Ahmed Ali", cat: "Informatique", annee: 2024 }
    ],
    adherents: JSON.parse(localStorage.getItem('lib_adh')) || [
        { id: 1, nom: "Karim", ville: "Casablanca" }
    ],
    emprunts: JSON.parse(localStorage.getItem('lib_emprunts')) || [] 
};

// --- AUTHENTIFICATION ---
document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    if(document.getElementById('user').value === 'admin' && document.getElementById('pass').value === 'admin') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        renderDashboard();
    } else alert("Identifiants incorrects (admin/admin)");
};

// --- NAVIGATION ---
document.querySelectorAll('.sidebar li').forEach(li => {
    li.onclick = function() {
        document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        if(target === 'dashboard') renderDashboard();
        if(target === 'livres') renderLivres();
        if(target === 'adherents') renderAdherents();
        if(target === 'emprunts') renderEmprunts();
    }
});

// --- DASHBOARD ---
function renderDashboard() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <h1>Dashboard Statistiques</h1>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-top:20px">
            <div class="card"><h3>Livres</h3><p>${db.livres.length}</p></div>
            <div class="card"><h3>Adhérents</h3><p>${db.adherents.length}</p></div>
            <div class="card"><h3>Emprunts</h3><p>${db.emprunts.length}</p></div>
        </div>
        <div class="card"><canvas id="myChart" height="100"></canvas></div>
    `;
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Livres', 'Adhérents'],
            datasets: [{ label: 'Total', data: [db.livres.length, db.adherents.length], backgroundColor: ['#3498db', '#2ecc71'] }]
        }
    });
}

// --- GESTION LIVRES (CRUD + RECHERCHE + CSV) ---
function renderLivres() {
    const main = document.getElementById('main-content'); // On cible la zone vide du HTML
    
    // On injecte le nouveau HTML pro avec la barre de recherche améliorée
    main.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2 style="color: var(--text-main); font-weight: 700;">📚 Gestion de la Bibliothèque</h2>
            <div>
                <button onclick="exportCSV(db.livres, 'livres.csv')" class="btn-action btn-success">Export CSV</button>
                <button onclick="showAddLivre()" class="btn-action btn-details">+ Nouveau Livre</button>
            </div>
        </div>
        
        <div class="card">
            <div class="search-wrapper">
                <input type="text" id="q" placeholder="Rechercher par titre ou auteur..." oninput="filterLivre()">
            </div>

            <table id="tLivres">
                <thead>
                    <tr>
                        <th>Titre du Livre</th>
                        <th>Auteur</th>
                        <th style="text-align:right">Actions</th>
                    </tr>
                </thead>
                <tbody id="bLivres">
                    </tbody>
            </table>
        </div>
    `;
    
    // Une fois que le HTML est injecté, on remplit le tableau avec les données
    updateLivreTable(db.livres);
}

function updateLivreTable(data) {
    const b = document.getElementById('bLivres');
    b.innerHTML = data.map(l => `
        <tr>
            <td>${l.titre}</td><td>${l.auteur}</td>
            <td>
                <button class="btn-action btn-details" onclick="showDetails(${l.id})">See Details</button>
                <button class="btn-action btn-delete" onclick="deleteItem('livres', ${l.id})">X</button>
            </td>
        </tr>`).join('');
}

// --- LOGIQUE COMMUNE ---
function deleteItem(type, id) {
    if(confirm("Confirmer ?")) {
        db[type] = db[type].filter(x => x.id !== id);
        localStorage.setItem('lib_'+type, JSON.stringify(db[type]));
        type === 'livres' ? renderLivres() : renderAdherents();
    }
}

function showDetails(id) {
    const l = db.livres.find(x => x.id === id);
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <button onclick="renderLivres()">← Retour</button>
        <div class="card" id="pdf-area" style="margin-top:20px">
            <h1>Fiche : ${l.titre}</h1>
            <p><strong>Auteur:</strong> ${l.auteur}</p>
            <p><strong>Catégorie:</strong> ${l.cat}</p>
            <p><strong>Année:</strong> ${l.annee}</p>
            <button onclick="exportPDF()" class="btn-action btn-details">Export PDF</button>
        </div>
    `;
}

// --- EXPORTS ---
function exportCSV(data, file) {
    let csv = "ID,Nom/Titre\n" + data.map(x => `${Object.values(x).join(',')}`).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file;
    a.click();
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(document.getElementById('pdf-area').innerText, 10, 10);
    doc.save('detail.pdf');
}

// Ajouter ici la fonction renderAdherents() sur le même modèle que renderLivres()
function renderAdherents() {
    const main = document.getElementById('main-content');
    main.innerHTML = `<h2>Adhérents</h2><div class="card">Tableau des adhérents ici (Similaire aux livres)</div>`;
}
function renderAdherents() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center">
            <h2>Liste des Adhérents</h2>
            <button onclick="exportCSV(db.adherents, 'adherents.csv')" class="btn-action btn-success">Export CSV</button>
        </div>
        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Ville</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="bAdherents"></tbody>
            </table>
        </div>
    `;
    const b = document.getElementById('bAdherents');
    // Injection des données d'adhérents stockées dans db.adherents
    b.innerHTML = db.adherents.map(a => `
        <tr>
            <td>${a.nom}</td>
            <td>${a.ville}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteItem('adherents', ${a.id})">Supprimer</button>
            </td>
        </tr>`).join('');
}
function updateLivreTable(data) {
    const b = document.getElementById('bLivres');
    b.innerHTML = data.map(l => `
        <tr>
            <td>${l.titre}</td>
            <td>${l.auteur}</td>
            <td>
                <button class="btn-action btn-details" onclick="showDetails(${l.id})">See Details</button>
                <button class="btn-action btn-delete" onclick="deleteItem('livres', ${l.id})">Supprimer</button>
                <button class="btn-action" style="background:#ff5722; color:white" onclick="exportDetailsPDF(${l.id})">PDF</button>
            </td>
        </tr>`).join('');
}
function deleteItem(type, id) {
    if(confirm("Voulez-vous vraiment supprimer cet élément ?")) {
        // Filtrage des données pour retirer l'élément par son ID
        db[type] = db[type].filter(x => x.id !== id);
        
        // Mise à jour du stockage local pour sauvegarder les modifications
        localStorage.setItem('lib_' + type, JSON.stringify(db[type]));
        
        // Rafraîchissement de l'affichage actuel
        if(type === 'livres') renderLivres();
        else renderAdherents();
    }
}
// --- FONCTION POUR AFFICHER LE FORMULAIRE D'AJOUT ---
function showAddLivre() {
    // Création de l'élément modal (le formulaire pop-up)
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="card" style="width: 400px; padding: 30px;">
            <h3>Ajouter un Nouveau Livre</h3>
            <hr><br>
            <input type="text" id="newTitre" placeholder="Titre du livre" style="width:100%"><br>
            <input type="text" id="newAuteur" placeholder="Nom de l'auteur" style="width:100%"><br>
            <select id="newCat" style="width:100%">
                <option value="Informatique">Informatique</option>
                <option value="Réseau">Réseau</option>
                <option value="Management">Management</option>
            </select><br>
            <input type="number" id="newAnnee" placeholder="Année de publication" style="width:100%"><br><br>
            <div style="display:flex; justify-content: space-between;">
                <button onclick="saveNewLivre()" class="btn-action btn-success">Enregistrer</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-action btn-delete">Annuler</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// --- SAUVEGARDE DANS LE LOCALSTORAGE ---
function saveNewLivre() {
    const titre = document.getElementById('newTitre').value;
    const auteur = document.getElementById('newAuteur').value;
    const cat = document.getElementById('newCat').value;
    const annee = document.getElementById('newAnnee').value;

    if (titre && auteur) {
        const nouveauLivre = {
            id: Date.now(), // Génère un ID unique
            titre: titre,
            auteur: auteur,
            cat: cat,
            annee: annee
        };

        db.livres.push(nouveauLivre);
        localStorage.setItem('lib_livres', JSON.stringify(db.livres)); // Sauvegarde
        document.querySelector('.modal').remove(); // Ferme la fenêtre
        renderLivres(); // Rafraîchit le tableau
    } else {
        alert("Veuillez remplir au moins le titre et l'auteur");
    }
}
function renderAdherents() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center">
            <h2>Gestion des Adhérents</h2>
            <button onclick="showAddAdherent()" class="btn-action btn-details">+ Nouvel Adhérent</button>
        </div>
        <div class="card" style="margin-top:20px">
            <table>
                <thead>
                    <tr><th>Nom</th><th>Ville</th><th>Actions</th></tr>
                </thead>
                <tbody id="bAdherents"></tbody>
            </table>
        </div>
    `;
    const b = document.getElementById('bAdherents');
    b.innerHTML = db.adherents.map(a => `
        <tr>
            <td>${a.nom}</td>
            <td>${a.ville}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteItem('adherents', ${a.id})">Supprimer</button>
            </td>
        </tr>`).join('');
}

function showAddAdherent() {
    const nom = prompt("Nom de l'adhérent :");
    const ville = prompt("Ville :");
    if(nom && ville) {
        db.adherents.push({ id: Date.now(), nom, ville });
        localStorage.setItem('lib_adherents', JSON.stringify(db.adherents));
        renderAdherents();
    }
}
// --- GESTION DES EMPRUNTS ---
function renderEmprunts() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center">
            <h2>Gestion des Emprunts</h2>
            <button onclick="showAddEmprunt()" class="btn-action btn-details">+ Nouvel Emprunt</button>
        </div>
        <div class="card" style="margin-top:20px">
            <table>
                <thead>
                    <tr>
                        <th>Livre</th>
                        <th>Adhérent</th>
                        <th>Date Emprunt</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="bEmprunts"></tbody>
            </table>
        </div>
    `;
    const b = document.getElementById('bEmprunts');
    b.innerHTML = db.emprunts.map(e => `
        <tr>
            <td>${e.livre}</td>
            <td>${e.adherent}</td>
            <td>${e.date}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteItem('emprunts', ${e.id})">Rendre le livre</button>
            </td>
        </tr>`).join('');
}

// --- FORMULAIRE D'EMPRUNT DYNAMIQUE ---
function showAddEmprunt() {
    // On vérifie s'il y a des livres et des adhérents pour faire un emprunt
    if(db.livres.length === 0 || db.adherents.length === 0) {
        alert("Vous devez avoir au moins un livre et un adhérent pour créer un emprunt.");
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="card" style="width: 400px; padding: 30px;">
            <h3>Créer un Emprunt</h3>
            <hr><br>
            <label>Sélectionner le livre :</label>
            <select id="empLivre" style="width:100%">
                ${db.livres.map(l => `<option value="${l.titre}">${l.titre}</option>`).join('')}
            </select><br><br>
            
            <label>Sélectionner l'adhérent :</label>
            <select id="empAdh" style="width:100%">
                ${db.adherents.map(a => `<option value="${a.nom}">${a.nom}</option>`).join('')}
            </select><br><br>

            <div style="display:flex; justify-content: space-between;">
                <button onclick="saveEmprunt()" class="btn-action btn-success">Valider</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-action btn-delete">Annuler</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEmprunt() {
    const livre = document.getElementById('empLivre').value;
    const adherent = document.getElementById('empAdh').value;
    const dateToday = new Date().toLocaleDateString();

    const nouvelEmprunt = {
        id: Date.now(),
        livre: livre,
        adherent: adherent,
        date: dateToday
    };

    db.emprunts.push(nouvelEmprunt);
    localStorage.setItem('lib_emprunts', JSON.stringify(db.emprunts));
    document.querySelector('.modal').remove();
    renderEmprunts();
}
function filterLivre() {
    const val = document.getElementById('q').value.toLowerCase();
    
    // On filtre la base de données
    const filtered = db.livres.filter(l => 
        l.titre.toLowerCase().includes(val) || 
        l.auteur.toLowerCase().includes(val) ||
        l.cat.toLowerCase().includes(val)
    );

    const tbody = document.getElementById('bLivres');
    
    // Si on trouve des résultats
    if (filtered.length > 0) {
        updateLivreTable(filtered);
    } else {
        // Si aucun résultat, on affiche un message propre dans le tableau
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="no-results">
                    Aucun livre ne correspond à votre recherche "${val}"
                </td>
            </tr>
        `;
    }
}
function exportCSV(data, fileName) {
    // 1. On définit les entêtes du fichier (ex: Titre, Auteur)
    const headers = Object.keys(data[0]).join(",");
    
    // 2. On transforme chaque objet en ligne de texte
    const rows = data.map(obj => Object.values(obj).join(","));
    
    // 3. On crée le contenu final
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    
    // 4. On crée un lien invisible pour forcer le téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
}
function exportDetailsPDF(id) {
    // 1. On récupère les données du livre via son ID
    const livre = db.livres.find(l => l.id === id);
    if (!livre) return;

    // 2. Initialisation de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 3. Mise en page du PDF (Design simple et pro)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FICHE TECHNIQUE DU LIVRE", 20, 30);
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35); // Ligne de séparation

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Titre : ${livre.titre}`, 20, 50);
    doc.text(`Auteur : ${livre.auteur}`, 20, 60);
    doc.text(`Catégorie : ${livre.cat}`, 20, 70);
    doc.text(`Année : ${livre.annee || 'N/A'}`, 20, 80);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Généré par BiblioManager Pro - 3IIR le ${new Date().toLocaleDateString()}`, 20, 280);

    // 4. Téléchargement automatique
    doc.save(`Fiche_${livre.titre.replace(/\s+/g, '_')}.pdf`);
}