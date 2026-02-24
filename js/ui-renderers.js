import { studyData } from './data-service.js';
import { openModal } from './modal-controller.js';
import { formatCategoryName, formatKey } from './utils.js';

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

    // Breadcrumb / intro
    const intro = document.createElement('div');
    intro.className = 'med-intro';
    intro.innerHTML = `
        <div class="med-intro-header">
            <h2>💊 Médicaments</h2>
            <p>${data.length} médicaments en ${[...new Set(data.map(d => d.details.classe))].length} classes cliniques</p>
        </div>
    `;
    contentArea.appendChild(intro);

    const grid = document.createElement('div');
    grid.className = 'grid-container';

    // Group by class
    const classes = [...new Set(data.map(item => item.details.classe))].sort();

    classes.forEach(className => {
        const medsInClass = data.filter(m => m.details.classe === className);
        const subClasses = [...new Set(medsInClass.map(m => m.details.sous_classe).filter(Boolean))].sort();
        const medCount = medsInClass.length;

        const classCard = document.createElement('div');
        classCard.className = 'card class-card med-class-card';
        classCard.innerHTML = `
            <div class="med-class-badge">
                <span class="card-category-label bg-medicament">Classe Clinique</span>
                <span class="med-count-badge">${medCount} molécule${medCount > 1 ? 's' : ''}</span>
            </div>
            <h3 class="card-title">${className}</h3>
            <div class="card-cta">Voir les médicaments →</div>
        `;
        classCard.onclick = () => window.navigateToMedicationClass(className);
        grid.appendChild(classCard);
    });

    contentArea.appendChild(grid);
}

export function renderMedicationsByClass(className, allData) {
    const meds = allData.filter(m => m.details.classe === className);
    const subClasses = [...new Set(meds.map(m => m.details.sous_classe))].sort();

    contentArea.innerHTML = `
        <div class="class-view-header">
            <button class="back-button" id="back-to-classes">← Toutes les classes</button>
            <div>
                <h2>${className}</h2>
                <p style="color: var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">
                    ${meds.length} médicament${meds.length > 1 ? 's' : ''}
                    ${subClasses.filter(Boolean).length > 1 ? ' · ' + subClasses.filter(Boolean).length + ' sous-classes' : ''}
                </p>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.className = 'med-subclass-container';

    subClasses.forEach(sub => {
        const section = document.createElement('div');
        section.className = 'med-subclass-section';

        if (sub) {
            const subHeader = document.createElement('div');
            subHeader.className = 'med-subclass-header';
            subHeader.innerHTML = `
                <div class="med-subclass-title">
                    <span class="med-subclass-dot"></span>
                    ${sub}
                </div>
                <span class="med-subclass-count">${meds.filter(m => m.details.sous_classe === sub).length} molécule${meds.filter(m => m.details.sous_classe === sub).length > 1 ? 's' : ''}</span>
            `;
            section.appendChild(subHeader);
        }

        const subGrid = document.createElement('div');
        subGrid.className = 'grid-container med-subclass-grid';

        meds.filter(m => m.details.sous_classe === sub).forEach(item => {
            subGrid.appendChild(createCard(item, 'bg-medicament', 'Médicament'));
        });

        section.appendChild(subGrid);
        container.appendChild(section);
    });

    contentArea.appendChild(container);
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
        systemCard.onclick = () => window.navigateToSystem(system, 'pathologies');
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
