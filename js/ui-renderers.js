import { studyData } from './data-service.js';
import { openModal } from './modal-controller.js';
import { formatCategoryName, formatKey } from './utils.js';
import { navigateToMedicationClass, navigateToSystem } from './navigation.js';

const contentArea = document.getElementById('content-area');

export function renderHome() {
    const homeData = studyData['home'];
    if (!homeData) {
        contentArea.innerHTML = '<div class="empty-state"><p>Bienvenue dans votre guide de poche.</p></div>';
        return;
    }

    let html = `
        <div class="home-view">
            <div class="home-hero">
                <h2>${homeData.welcome_title}</h2>
                <p>${homeData.welcome_text}</p>
            </div>
            <div class="grid-container">`;

    homeData.featured.forEach(item => {
        html += `
            <div class="card featured-card" onclick="loadCategory('${item.category}')">
                <span class="card-category-label bg-${item.category.slice(0, 4)}">${formatCategoryName(item.category)}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-preview">${item.description}</p>
                <div class="card-cta">Explorer →</div>
            </div>`;
    });

    html += `</div></div>`;
    contentArea.innerHTML = html;
}

export function renderContent(viewName, data) {
    if (viewName === 'medicaments') {
        renderMedicationClasses(data);
        return;
    }

    if (viewName === 'pathologies') {
        renderPathologySystems(data);
        return;
    }

    if (viewName === 'gazometrie') {
        import('./gazometrie-tool.js').then(module => module.renderGazometrie());
        return;
    }

    contentArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-container';

    data.forEach(item => {
        grid.appendChild(createCard(item, `bg-${viewName.slice(0, 4)}`, viewName));
    });

    contentArea.appendChild(grid);
}

export function createCard(item, labelClass, itemCat) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <span class="card-category-label ${labelClass}">${itemCat}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-preview">${item.preview || 'Voir les détails...'}</p>
        <div class="card-cta">Voir la fiche →</div>
    `;
    card.onclick = () => openModal(item);
    return card;
}

export function renderMedicationClasses(data) {
    contentArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-container';

    // Group by class
    const classes = [...new Set(data.map(item => item.details.classe))].sort();

    classes.forEach(className => {
        const classCard = document.createElement('div');
        classCard.className = 'card class-card';
        classCard.innerHTML = `
            <span class="card-category-label bg-medicament">Classe Clinique</span>
            <h3 class="card-title">${className}</h3>
            <p class="card-preview">Explorer les molécules de cette classe.</p>
            <div class="card-cta">Voir les médicaments →</div>
        `;
        classCard.onclick = () => navigateToMedicationClass(className);
        grid.appendChild(classCard);
    });

    contentArea.appendChild(grid);
}

export function renderMedicationsByClass(className, allData) {
    contentArea.innerHTML = `
        <div class="class-view-header">
            <button class="back-button" id="back-to-classes">← Toutes les classes</button>
            <h2>${className}</h2>
        </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'grid-container';

    const meds = allData.filter(m => m.details.classe === className);

    // Grouping by sub-class for better UI inside the class
    const subClasses = [...new Set(meds.map(m => m.details.sous_classe))].sort();

    subClasses.forEach(sub => {
        if (sub) {
            const separator = document.createElement('div');
            separator.className = 'sub-class-header';
            separator.innerText = sub;
            grid.appendChild(separator);
        }

        meds.filter(m => m.details.sous_classe === sub).forEach(item => {
            grid.appendChild(createCard(item, 'bg-medicament', 'Médicament'));
        });
    });

    contentArea.appendChild(grid);
    document.getElementById('back-to-classes').onclick = () => renderMedicationClasses(allData);
}

export function renderPathologySystems(data) {
    contentArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-container';

    const systems = [...new Set(data.map(item => item.systeme))].sort();

    systems.forEach(system => {
        const systemCard = document.createElement('div');
        systemCard.className = 'card class-card';
        systemCard.innerHTML = `
            <span class="card-category-label bg-pathology">Système</span>
            <h3 class="card-title">${system}</h3>
            <p class="card-preview">Pathologies du système ${system.toLowerCase()}.</p>
            <div class="card-cta">Explorer →</div>
        `;
        systemCard.onclick = () => navigateToSystem(system, 'pathologies');
        grid.appendChild(systemCard);
    });

    contentArea.appendChild(grid);
}

export function renderPathologiesBySystem(systemName, allData) {
    contentArea.innerHTML = `
        <div class="class-view-header">
            <button class="back-button" id="back-to-systems">← Tous les systèmes</button>
            <h2>${systemName}</h2>
        </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'grid-container';

    const items = allData.filter(item => item.systeme === systemName);

    items.forEach(item => {
        grid.appendChild(createCard(item, 'bg-pathol', 'Pathologie'));
    });

    contentArea.appendChild(grid);
    document.getElementById('back-to-systems').onclick = () => renderPathologySystems(allData);
}
