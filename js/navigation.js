import { studyData } from './data-service.js';
import { renderContent, renderHome, renderMedicationsBySubClass, renderPathologiesBySystem } from './ui-renderers.js';
import { closeModal, openModal } from './modal-controller.js';
import { handleSmartLink } from './smart-links.js';

let currentCategory = 'pathologies';
const navButtons = document.querySelectorAll('.nav-item');

export function loadCategory(category) {
    currentCategory = category;
    updateActiveTab(category);

    const mainNav = document.querySelector('.main-nav');
    if (category === 'home') {
        if (mainNav) mainNav.classList.add('nav-hidden');
        renderHome();
        return;
    }

    if (mainNav) mainNav.classList.remove('nav-hidden');

    if (category === 'gazometrie') {
        renderContent(category, null);
        return;
    }

    const data = studyData[category];
    if (data) {
        renderContent(category, data);
    } else {
        console.error('Données non trouvées pour:', category);
    }
}

export function updateActiveTab(category) {
    navButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

export function navigateToCategory(category) {
    closeModal();
    loadCategory(category);
}

export function navigateToSystem(systemName, category) {
    closeModal();
    loadCategory(category);
    renderPathologiesBySystem(systemName, studyData[category]);
}

export function navigateToMedicationClass(groupName) {
    closeModal();
    loadCategory('medicaments');
    // We need to filter by major group since renderMedicationsBySubClass expects the filtered list
    const allMeds = studyData['medicaments'];
    const lowerGroup = groupName.toLowerCase();
    const filteredMeds = allMeds.filter(m => {
        const rawName = m.details.classe || m.details.sous_classe || 'Divers';
        const lowerRaw = rawName.toLowerCase();
        // Check if the groupName is the major group or the full subclass
        return lowerRaw.startsWith(lowerGroup) || lowerRaw.includes(lowerGroup);
    });
    renderMedicationsBySubClass(groupName, filteredMeds);
}

export function setupEventListeners() {
    // Nav Buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            loadCategory(btn.dataset.category);
        });
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length > 1) {
                performGlobalSearch(term);
            } else if (term.length === 0) {
                loadCategory(currentCategory);
            }
        });
    }

    // Modal Close on backdrop click
    const modal = document.getElementById('modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Modal Close on button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Escape key for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Smart link clicks (delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('smart-link')) {
            const target = e.target.dataset.target;
            handleSmartLink(target);
        }
    });

    // Sources button
    const sourcesBtn = document.getElementById('sources-btn');
    if (sourcesBtn) {
        sourcesBtn.addEventListener('click', () => {
            const sourcesData = studyData['sources'];
            if (sourcesData) {
                openModal(sourcesData);
            }
        });
    }
}

function performGlobalSearch(term) {
    const results = [];
    const mainCategories = ['pathologies', 'medicaments', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies', 'interventions', 'perinatalite-pediatrie'];

    mainCategories.forEach(cat => {
        if (studyData[cat]) {
            const matches = studyData[cat].filter(item =>
                item.title.toLowerCase().includes(term) ||
                (item.preview && item.preview.toLowerCase().includes(term)) ||
                (item.details && item.details.classe && item.details.classe.toLowerCase().includes(term))
            );
            results.push(...matches);
        }
    });

    const mainNav = document.querySelector('.main-nav');
    if (mainNav) mainNav.classList.remove('nav-hidden');

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<h2 class="search-results-title">Résultats pour "${term}" (${results.length})</h2>`;

    if (results.length === 0) {
        contentArea.innerHTML += '<div class="empty-state"><p>Aucun résultat trouvé.</p></div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid-container';

    results.forEach(item => {
        const gridItem = document.createElement('div');
        gridItem.className = 'card';
        gridItem.innerHTML = `
            <span class="card-category-label bg-${item.category.slice(0, 4)}">${item.category}</span>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-preview">${item.preview || ''}</p>
            <div class="card-cta">Voir la fiche →</div>
        `;
        gridItem.onclick = () => {
            openModal(item);
        };
        grid.appendChild(gridItem);
    });

    contentArea.appendChild(grid);
}
