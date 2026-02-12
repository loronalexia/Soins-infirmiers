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

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    data.forEach(item => {
        // Determine style based on item's category, not global view
        const itemCat = item.category || viewName;

        let labelClass = 'bg-pathology';
        if (itemCat === 'medicaments') labelClass = 'bg-medicament';
        else if (itemCat === 'examens-paracliniques') labelClass = 'bg-para';
        else if (itemCat === 'examens-cliniques') labelClass = 'bg-clinic';

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

        gridContainer.appendChild(card);
    });

    contentArea.appendChild(gridContainer);
}

// Helper to format category name
function formatCategoryName(slug) {
    if (slug === 'examens-paracliniques') return 'Examen Paraclinique';
    if (slug === 'examens-cliniques') return 'Examen Clinique';
    if (slug === 'recherche') return 'Résultat';
    if (!slug) return '';
    return slug.charAt(0).toUpperCase() + slug.slice(1, -1);
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
            value.forEach(li => contentHtml += `<li>${li}</li>`);
            contentHtml += `</ul>`;
        } else {
            contentHtml += `<p>${value}</p>`;
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
                document.getElementById('search-input').value = '';
            }
        });
    });

    // Modal Close
    closeModalBtn.addEventListener('click', closeModal);

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        if (query.trim() === '') {
            renderContent(currentCategory, studyData[currentCategory]);
            return;
        }

        let allData = [];
        Object.values(studyData).forEach(catData => {
            if (catData) allData = allData.concat(catData);
        });

        const filteredData = allData.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const previewMatch = item.preview.toLowerCase().includes(query);
            return titleMatch || previewMatch;
        });

        renderContent('recherche', filteredData);

        navButtons.forEach(btn => btn.classList.remove('active'));
    });
}

// Run
document.addEventListener('DOMContentLoaded', init);
