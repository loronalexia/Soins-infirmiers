// DOM Elements
const contentArea = document.getElementById('content-area');
const navButtons = document.querySelectorAll('.nav-item');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');

// State
let currentCategory = 'pathologies';
// Cache for loaded data
// We will fill this object with keys corresponding to categories
let studyData = {};
const categories = ['pathologies', 'medicaments', 'examens-paracliniques', 'examens-cliniques'];

// Initialize
async function init() {
    await preloadAllData();
    // Start with default category - rendering from cache
    loadCategory(currentCategory);
    setupEventListeners();
}

// Preload All Data
async function preloadAllData() {
    contentArea.innerHTML = '<div class="loading">Chargement des données...</div>';
    try {
        const promises = categories.map(cat => fetch(`${cat}.json`).then(res => {
            if (!res.ok) throw new Error(`Erreur chargement ${cat}`);
            return res.json().then(data => ({ category: cat, data }));
        }));

        const results = await Promise.all(promises);
        results.forEach(result => {
            studyData[result.category] = result.data;
        });

        // No need to call loadCategory here if init does it after await

    } catch (error) {
        console.error('Erreur preloading:', error);
        contentArea.innerHTML = `
            <div class="error-state">
                <p>Erreur lors du chargement des données.</p>
                <p class="error-details">Assurez-vous d'utiliser un serveur local.</p>
                <p class="error-tech">${error.message}</p>
            </div>
        `;
    }
}

// Load Category Data
function loadCategory(category) {
    // Update active tab UI
    updateActiveTab(category);

    // Render from cache
    if (studyData[category]) {
        renderContent(category, studyData[category]);
    } else {
        // Fallback or error if not loaded
        // Only show error if we are not in a loading state (which preload handles)
        // But since init waits for preload, we should have data here.
        if (Object.keys(studyData).length === 0) {
            // If completely empty, maybe preload failed.
            // We assume error is shown by preload catch block.
        } else {
            contentArea.innerHTML = '<div class="error-state">Données non disponibles pour cette catégorie.</div>';
        }
    }
}

// Update Active Tab
function updateActiveTab(category) {
    navButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Render Content
function renderContent(viewName, data) {
    contentArea.innerHTML = '';

    if (!data || data.length === 0) {
        contentArea.innerHTML = '<p class="empty-state">Aucun résultat trouvé.</p>';
        return;
    }

    // Special handling for medicaments view
    if (viewName === 'medicaments') {
        renderMedicationClasses(data);
        return;
    }

    // Special handling for pathologies view (System grouping)
    if (viewName === 'pathologies') {
        renderPathologySystems(data);
        return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    data.forEach(item => {
        // Determine style based on item's category, not global view
        const itemCat = item.category || viewName;

        let labelClass = 'bg-pathology';
        if (itemCat === 'medicaments') labelClass = 'bg-medicament';
        else if (itemCat === 'examens-paracliniques') labelClass = 'bg-para';
        else if (itemCat === 'examens-cliniques') labelClass = 'bg-clinic';

        const card = createCard(item, labelClass, itemCat);
        gridContainer.appendChild(card);
    });

    contentArea.appendChild(gridContainer);
}

// Helper to create a card (extracted for reuse)
function createCard(item, labelClass, itemCat) {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openModal(item);

    card.innerHTML = `
        <span class="card-category-label ${labelClass}">${formatCategoryName(itemCat)}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-preview">${item.preview}</p>
        <div class="card-cta">
            Voir la fiche
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
    `;
    return card;
}

// Render Medication Classes
function renderMedicationClasses(data) {
    // Extract unique classes
    const classes = [...new Set(data.map(item => item.details.classe))].sort();

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    classes.forEach(classeName => {
        const card = document.createElement('div');
        card.className = 'card class-card'; // Add specific class for styling if needed
        // Count items in this class
        const count = data.filter(item => item.details.classe === classeName).length;

        card.onclick = () => renderMedicationsByClass(classeName, data);

        card.innerHTML = `
             <div class="card-category-label bg-medicament">Classe Thérapeutique</div>
            <h3 class="card-title">${classeName}</h3>
            <p class="card-preview">${count} médicament${count > 1 ? 's' : ''}</p>
            <div class="card-cta">
                Voir la liste
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    contentArea.appendChild(gridContainer);
}

// Render Medications by Specific Class
function renderMedicationsByClass(className, allData) {
    contentArea.innerHTML = '';

    // Filter and Sort
    const filteredData = allData
        .filter(item => item.details.classe === className)
        .sort((a, b) => a.title.localeCompare(b.title));

    // Header with back button
    const header = document.createElement('div');
    header.className = 'class-view-header';
    header.innerHTML = `
        <button class="back-button" onclick="loadCategory('medicaments')">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Retour aux classes
        </button>
        <h2>${className}</h2>
    `;
    contentArea.appendChild(header);

    // Grouping by sub-class if they exist
    const hasSubClasses = filteredData.some(item => item.details.sous_classe);

    if (hasSubClasses) {
        // Get unique sub-classes in their appearance order (or alphabetical)
        const subClasses = [...new Set(filteredData.map(item => item.details.sous_classe || 'Divers'))].sort();

        subClasses.forEach(subName => {
            const subHeader = document.createElement('h3');
            subHeader.className = 'sub-class-header';
            subHeader.textContent = subName;
            contentArea.appendChild(subHeader);

            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid-container';
            gridContainer.style.marginBottom = '2.5rem';

            filteredData
                .filter(item => (item.details.sous_classe || 'Divers') === subName)
                .forEach(item => {
                    const card = createCard(item, 'bg-medicament', 'medicaments');
                    gridContainer.appendChild(card);
                });

            contentArea.appendChild(gridContainer);
        });
    } else {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        filteredData.forEach(item => {
            const card = createCard(item, 'bg-medicament', 'medicaments');
            gridContainer.appendChild(card);
        });

        contentArea.appendChild(gridContainer);
    }
}

// Helper to format category name
function formatCategoryName(slug) {
    const names = {
        'pathologies': 'Pathologies',
        'medicaments': 'Médicaments',
        'examens-paracliniques': 'Examens Paracliniques',
        'examens-cliniques': 'Examens Cliniques',
        'recherche': 'Résultat'
    };
    return names[slug] || slug;
}

// SMART LINKING LOGIC
const linkMapping = [
    { keywords: ['diurétique', 'diuretique'], target: 'Diurétiques' },
    { keywords: ['bêta-bloquant', 'beta-bloquant', 'bêtabloquant'], target: 'Antihypertenseurs' },
    { keywords: ['ieca', 'iec', 'inhibiteur de l’enzyme de conversion'], target: 'Antihypertenseurs' },
    { keywords: ['ara ii', 'ara 2', 'antagoniste récepteur de l’angiotensine'], target: 'Antihypertenseurs' },
    { keywords: ['bloqueur des canaux calciques', 'inhibiteur calcique'], target: 'Antihypertenseurs' },
    { keywords: ['aspirine', 'aas'], target: 'Aspirine' },
    { keywords: ['anticoagulant'], target: 'Anticoagulant' },
    { keywords: ['statine'], target: 'Antihypertenseurs' }
];

function formatSmartLinks(text) {
    if (typeof text !== 'string') return text;
    let newText = text;

    linkMapping.forEach(link => {
        link.keywords.forEach(keyword => {
            // Case insensitive, handling potential plural 's'
            const regex = new RegExp(`(\\b${keyword}s?\\b)`, 'gi');
            // Escape single quotes for the onclick attribute
            const escapedTarget = link.target.replace(/'/g, "\\'");
            newText = newText.replace(regex, `<span class="smart-link" onclick="handleSmartLink(this.textContent, '${escapedTarget}')">$1</span>`);
        });
    });

    return newText;
}

function handleSmartLink(originalText, targetName) {
    closeModal();

    // Ensure data is available
    const allMedData = studyData['medicaments'];
    if (!allMedData) {
        console.error('Données médicaments non chargées');
        loadCategory('medicaments');
        return;
    }

    // 1. Try to find a direct medication by title (exact case insensitive)
    // Clean text: lowercase and remove trailing 's' if any
    const cleanText = originalText.toLowerCase().trim().replace(/s$/, '');
    const exactMed = allMedData.find(m =>
        m.title.toLowerCase().includes(cleanText) ||
        (m.details.sous_classe && m.details.sous_classe.toLowerCase().includes(cleanText))
    );

    if (exactMed && cleanText.length > 3) { // Avoid false positives on very short words
        // If it's a very specific medication, open it
        setTimeout(() => openModal(exactMed), 100);
        return;
    }

    // 2. Otherwise navigate to class view
    loadCategory('medicaments');
    setTimeout(() => {
        renderMedicationsByClass(targetName, allMedData);
        // Scroll to top to ensure visibility
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

// Open Modal with Details
function openModal(item) {
    // Get color class for category label
    let labelClass = 'bg-pathology';
    if (item.category === 'medicaments') labelClass = 'bg-medicament';
    else if (item.category === 'examens-paracliniques') labelClass = 'bg-para';
    else if (item.category === 'examens-cliniques') labelClass = 'bg-clinic';

    let contentHtml = `
        <div class="detail-header">
            <h2 class="detail-title">${item.title}</h2>
            <div class="card-category-label ${labelClass}" style="margin:0">${formatCategoryName(item.category)}</div>
        </div>
        <div class="detail-body">
    `;

    // Dynamically generate details based on keys
    for (const [key, value] of Object.entries(item.details)) {
        // Skip grouping-only fields in the modal
        if (key === 'classe' || key === 'sous_classe') continue;

        // Check for special image object
        if (value && typeof value === 'object' && value.type === 'image' && !Array.isArray(value)) {
            contentHtml += `
                <div class="detail-section detail-image-container">
                    <h3 class="detail-image-title">${value.title}</h3>
                    <img src="${value.url}" alt="${value.title}" class="detail-flexible-image">
                </div>
            `;
            continue;
        }

        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        contentHtml += `
            <div class="detail-section">
                <h3>${label}</h3>
        `;

        if (Array.isArray(value)) {
            contentHtml += `<ul>`;
            value.forEach(li => contentHtml += `<li>${formatSmartLinks(li)}</li>`);
            contentHtml += `</ul>`;
        } else {
            contentHtml += `<p>${formatSmartLinks(value)}</p>`;
        }

        contentHtml += `</div>`;
    }

    // Image Section (Comparison or Gallery)
    if (item.images) {
        // Case 1: Comparison (Object with specific keys)
        if (!Array.isArray(item.images) && item.images.sain && item.images.malade) {
            contentHtml += `
                <div class="detail-section">
                    <h3>Comparaison Radiologique</h3>
                    <div class="comparison-container">
                        <div class="comparison-item">
                            <img src="${item.images.sain}" alt="Radio Poumons Sains">
                            <span class="comparison-caption">Poumons Sains</span>
                        </div>
                        <div class="comparison-item">
                            <img src="${item.images.malade}" alt="Radio Pneumonie">
                            <span class="comparison-caption">Pneumonie</span>
                        </div>
                    </div>
                </div>
            `;
        }
        // Case 2: Gallery (Array of objects)
        else if (Array.isArray(item.images)) {
            contentHtml += `
                <div class="detail-section">
                    <h3>Galerie Images</h3>
                    <div class="gallery-container">
            `;

            item.images.forEach(img => {
                contentHtml += `
                    <div class="gallery-item">
                        <img src="${img.url}" alt="${img.titre || 'Image'}">
                        ${img.titre ? `<span class="comparison-caption">${img.titre}</span>` : ''}
                    </div>
                `;
            });

            contentHtml += `
                    </div>
                </div>
            `;
        }
    }

    contentHtml += `</div>`;

    modalBody.innerHTML = contentHtml;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close Modal
function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Event Listeners
function setupEventListeners() {
    // Navigation Tabs
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            if (category !== currentCategory) {
                currentCategory = category;
                loadCategory(currentCategory);
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
            }
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                // Pre-filter across all categories for global search
                const allResults = [];
                const categoriesToSearch = Object.keys(studyData);
                categoriesToSearch.forEach(cat => {
                    if (studyData[cat]) {
                        const filtered = studyData[cat].filter(item =>
                            item.title.toLowerCase().includes(query) ||
                            (item.preview && item.preview.toLowerCase().includes(query))
                        ).map(item => ({ ...item, category: cat }));
                        allResults.push(...filtered);
                    }
                });
                renderContent('recherche', allResults);
            } else {
                loadCategory(currentCategory);
            }
        });
    }

    // Sources and References Logic
    const sourcesBtn = document.getElementById('sources-btn');
    if (sourcesBtn) {
        sourcesBtn.addEventListener('click', showSources);
    }
}

function showSources() {
    const sourcesData = {
        title: "Sources & Références",
        category: "recherche",
        details: {
            "Ouvrages de référence": [
                "Brunner & Suddarth, 'Soins infirmiers en médecine et chirurgie'",
                "P. Lewis, 'Soins infirmiers : Pratique et théorie'",
                "Vidals et guides pharmacologiques officiels"
            ],
            "Ressources Académiques": [
                "Protocoles cliniques des centres hospitaliers universitaires",
                "Cours et modules de formation en soins infirmiers (IFSI / Cégep)",
                "OIIQ / Ordres professionnels de santé"
            ],
            "Note sur le plagiat": "Cette plateforme est un outil de révision personnel. Les contenus sont synthétisés à partir de sources académiques et cliniques reconnues pour garantir l'exactitude des informations tout en respectant la propriété intellectuelle."
        }
    };
    openModal(sourcesData);
}

// Run
document.addEventListener('DOMContentLoaded', init);

// Render Pathology Systems
function renderPathologySystems(data) {
    // Extract unique systems
    const systems = [...new Set(data.map(item => item.systeme || 'Autres'))].sort();

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    systems.forEach(systemName => {
        const card = document.createElement('div');
        card.className = 'card class-card';
        const count = data.filter(item => (item.systeme || 'Autres') === systemName).length;

        card.onclick = () => renderPathologiesBySystem(systemName, data);

        card.innerHTML = `
             <div class="card-category-label bg-pathology">Système</div>
            <h3 class="card-title">${systemName}</h3>
            <p class="card-preview">${count} pathologie${count > 1 ? 's' : ''}</p>
            <div class="card-cta">
                Voir la liste
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    contentArea.appendChild(gridContainer);
}

// Render Pathologies by System
function renderPathologiesBySystem(systemName, allData) {
    contentArea.innerHTML = '';

    // Filter and Sort
    const filteredData = allData
        .filter(item => (item.systeme || 'Autres') === systemName)
        .sort((a, b) => a.title.localeCompare(b.title));

    // Header with back button
    const header = document.createElement('div');
    header.className = 'class-view-header';
    header.innerHTML = `
        <button class="back-button" onclick="loadCategory('pathologies')">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Retour aux systèmes
        </button>
        <h2>${systemName}</h2>
    `;
    contentArea.appendChild(header);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    filteredData.forEach(item => {
        const card = createCard(item, 'bg-pathology', 'pathologies');
        gridContainer.appendChild(card);
    });

    contentArea.appendChild(gridContainer);
}
