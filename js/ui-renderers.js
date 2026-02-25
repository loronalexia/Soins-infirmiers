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
                <h2>${homeData.hero?.title || 'Bienvenue !'}</h2>
                <p>${homeData.hero?.subtitle || ''}</p>
            </div>
            <div class="grid-container">`;

    const iconMapping = {
        'heart': '❤️',
        'pill': '💊',
        'microscope': '🔬',
        'stethoscope': '🩺',
        'bandage': '🩹',
        'syringe': '💉',
        'activity': '📈',
        'baby': '👶'
    };

    const modules = homeData.modules || [];
    modules.forEach(item => {
        const categoryId = item.id;
        const icon = iconMapping[item.icon] || '📁';
        html += `
            <div class="card featured-card" onclick="loadCategory('${categoryId}')">
                <div class="module-icon-container">${icon}</div>
                <h3 class="card-title">${item.title}</h3>
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
    `;
    card.onclick = () => openModal(item);
    return card;
}

// Helper to group classes by their main name (e.g. "AINS - Selectif" -> "AINS")
function getMajorGroup(name) {
    if (!name) return 'Divers';
    // Return the full name to avoid cutting off parts like "(AINS)" or long clinical names
    return name.trim();
}

export function renderMedicationClasses(data) {
    contentArea.innerHTML = '';

    // Grouping logic: find unique major groups
    const groupsMap = new Map();
    data.forEach(item => {
        // Prioritize 'classe' for grouping, fallback to 'sous_classe'
        const rawName = item.details.classe || item.details.sous_classe || 'Divers';
        const groupName = getMajorGroup(rawName);
        if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, {
                meds: [],
                subClasses: new Set(),
                mainCat: item.details.classe || item.details.sous_classe
            });
        }
        const group = groupsMap.get(groupName);
        group.meds.push(item);
        if (item.details.sous_classe) group.subClasses.add(item.details.sous_classe);
        if (item.details.classe) group.subClasses.add(item.details.classe);
    });

    const sortedGroups = Array.from(groupsMap.keys()).sort();

    // Stats bar + Filter
    const intro = document.createElement('div');
    intro.className = 'med-intro';
    intro.innerHTML = `
        <div class="med-intro-header">
            <h2>💊 Médicaments</h2>
            <p>${data.length} médicaments répartis en ${sortedGroups.length} groupes principaux</p>
        </div>
        <div class="med-filter-bar">
            <span class="med-filter-icon">🔍</span>
            <input type="text" class="med-filter-input" id="med-class-filter" placeholder="Chercher un groupe (ex: AINS, Anticoagulant)...">
        </div>
    `;
    contentArea.appendChild(intro);

    const grid = document.createElement('div');
    grid.className = 'grid-container';
    grid.id = 'med-classes-grid';

    sortedGroups.forEach(groupName => {
        const group = groupsMap.get(groupName);
        // COUNT ONLY MOLECULES (exclude class sheet)
        const moleculeMeds = group.meds.filter(m => !m.is_class_sheet);
        const medCount = moleculeMeds.length;

        // Try to find a matching image at root
        // Normalize name: lowercase, no accents, remove spaces/special chars
        const normalizedName = groupName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        // Potential image paths (matching the identified files at root)
        // Note: In a real production app, we'd have a manifest, but here we can check known patterns
        const hasImage = [
            'analgesiquesopioides', 'antiarythmique', 'antibiotiques', 'anticonvulsivants',
            'antidepresseurs', 'antidiabetiques', 'antihypertenseurs', 'antiparkinsoniens',
            'antipsychotiques', 'antiulcereux', 'betabloquants', 'corticosteroides',
            'diuretiques', 'hypolipidemiants'
        ].includes(normalizedName);

        const imageUrl = hasImage ? `assets/${normalizedName}.png` : '';

        const classCard = document.createElement('div');
        classCard.className = `card med-class-card ${hasImage ? 'has-image' : ''}`;
        classCard.dataset.search = groupName.toLowerCase();

        if (hasImage) {
            classCard.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url('${imageUrl}')`;
        }

        classCard.innerHTML = `
            <div class="med-class-badge">
                <span class="med-count-badge">${medCount} molécule${medCount > 1 ? 's' : ''}</span>
            </div>
            <h3 class="card-title">${groupName}</h3>
            <p class="card-preview">
                Découvrez les ${medCount} molécules de cette classe clinique.
            </p>
        `;
        classCard.onclick = () => renderMedicationsBySubClass(groupName, group.meds);
        grid.appendChild(classCard);
    });

    contentArea.appendChild(grid);

    // Filter logic
    const filterInput = document.getElementById('med-class-filter');
    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = grid.querySelectorAll('.med-class-card');
        cards.forEach(card => {
            const matches = card.dataset.search.includes(term);
            card.style.display = matches ? 'flex' : 'none';
        });
    });
}

export function renderMedicationsBySubClass(groupName, meds) {
    // 1. Check if a Class Sheet exists in this group
    const classSheet = meds.find(m => m.is_class_sheet === true);

    // If a class sheet exists, we open it first in the modal
    if (classSheet) {
        openModal(classSheet);
    }

    // 2. Render the list of molecules (as before)
    // Filter out the class sheet itself if it's in the list
    const moleculeMeds = meds.filter(m => !m.is_class_sheet);

    // Sort A-Z by title
    const sortedMeds = [...moleculeMeds].sort((a, b) => a.title.localeCompare(b.title));

    contentArea.innerHTML = `
        <div class="medication-list-header">
            <button class="back-button" id="back-to-classes">← Tous les groupes</button>
            <div class="class-view-header" style="margin-bottom:0; flex-direction:column; align-items:flex-start;">
                <h2>${groupName}</h2>
                <p style="color: var(--text-muted); font-size:0.95rem;">
                    ${sortedMeds.length > 0
            ? `${sortedMeds.length} molécule${sortedMeds.length > 1 ? 's' : ''} triée${sortedMeds.length > 1 ? 's' : ''} par ordre alphabétique`
            : "Aucune molécule détaillée pour le moment."}
                </p>
            </div>
        </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'med-alphabetical-grid';

    sortedMeds.forEach(item => {
        grid.appendChild(createCard(item, 'bg-medicament', 'Molécule'));
    });

    contentArea.appendChild(grid);

    // Get all initial data for back button
    import('./data-service.js').then(module => {
        document.getElementById('back-to-classes').onclick = () => renderMedicationClasses(module.studyData['medicaments']);
    });
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
