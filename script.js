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
const categories = ['pathologies', 'medicaments', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies', 'interventions', 'gazometrie', 'perinatalite-pediatrie'];

// Modal Navigation History
let currentModalItem = null;
let modalHistory = [];
let referringItem = null; // Track item that triggered a cross-view link

// Global Constants
async function init() {
    await preloadAllData();
    // Start with Home view by default
    loadCategory('home');
    setupEventListeners();
}

// Preload All Data
async function preloadAllData() {
    contentArea.innerHTML = '<div class="loading">Chargement des données...</div>';
    try {
        // Categories for main navigation
        const mainCategories = ['pathologies', 'medicaments', 'interventions', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies', 'perinatalite-pediatrie'];
        // All files to load (including invisible ones like sources and home)
        const filesToLoad = [...mainCategories, 'sources', 'home'];

        const promises = filesToLoad.map(cat => fetch(`${cat}.json`).then(res => {
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
    currentCategory = category;
    referringItem = null; // Clear referrer when switching tabs manually

    // Update active tab UI
    updateActiveTab(category);

    // If home, render home and set landing state
    if (category === 'home') {
        document.body.classList.add('is-home');
        renderHome();
        return;
    } else if (category === 'gazometrie') {
        document.body.classList.remove('is-home');
        renderGazometrie();
        return;
    } else {
        document.body.classList.remove('is-home');
    }

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

// Render Home view
function renderHome() {
    const data = studyData.home;
    if (!data) return;

    let modulesHtml = '';
    data.modules.forEach(module => {
        let iconSvg = '';
        // Map icon names to refined SVG paths
        switch (module.icon) {
            case 'heart':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.85.85 2.23.85 3.08 0l2.92-2.92"/></svg>`;
                break;
            case 'pill':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/><path d="M4.5 13.5l3.5 3.5"/><path d="M16 5l3.5 3.5"/></svg>`;
                break;
            case 'microscope':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`;
                break;
            case 'stethoscope':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>`;
                break;
            case 'bandage':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5h4"/><path d="M2 10v4"/><path d="M22 10v4"/><path d="M10 19h4"/><rect x="12" y="2" width="0.1" height="20"/><rect x="2" y="12" width="20" height="0.1"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>`;
                break;
            case 'syringe':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`;
                break;
            case 'baby':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5.7 4.9 2.1"/><path d="M12 3v2"/><path d="M14 8c.3-1 .8-1.5 1.5-2"/><path d="M16 12c.3-1 .8-1.5 1.5-2"/><path d="M12 21v1"/><path d="M12 22v0"/></svg>`;
                break;
            case 'activity':
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
                break;
            default:
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        }

        modulesHtml += `
            <div class="module-card" onclick="loadCategory('${module.id}')">
                <div class="module-icon" style="background-color: ${module.color};">
                    ${iconSvg}
                </div>
                <h3>${module.title}</h3>
                <p>${module.description}</p>
                <div class="module-arrow">Explorer <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>
            </div>
        `;
    });

    contentArea.innerHTML = `
        <div class="home-hero">
            <h2>${data.hero.title}</h2>
            <p>${data.hero.subtitle}</p>
            
            <div class="home-modules-grid">
                ${modulesHtml}
            </div>
        </div>
    `;
}

// Render Content
function renderContent(viewName, data) {
    contentArea.innerHTML = '';

    if (!data || data.length === 0) {
        contentArea.innerHTML = '<p class="empty-state">Aucun résultat trouvé.</p>';
        return;
    }

    // Sort alphabetically by title
    const sortedData = [...data].sort((a, b) => a.title.localeCompare(b.title));

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

    sortedData.forEach(item => {
        // Determine style based on item's category, not global view
        const itemCat = item.category || viewName;

        let labelClass = 'bg-pathology';
        if (itemCat === 'medicaments') labelClass = 'bg-medicament';
        else if (itemCat === 'examens-paracliniques') labelClass = 'bg-para';
        else if (itemCat === 'examens-cliniques') labelClass = 'bg-clinic';
        else if (itemCat === 'soins-de-plaies') labelClass = 'bg-wound';
        else if (itemCat === 'interventions') labelClass = 'bg-intervention';
        else if (itemCat === 'perinatalite-pediatrie') labelClass = 'bg-peri';

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

    let backToReferrer = '';
    if (referringItem) {
        backToReferrer = `
            <button class="back-button referrer-back" onclick="openReferrer()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Retour à : ${referringItem.title}
            </button>
        `;
    }

    header.innerHTML = `
        <div class="header-nav-group">
            <button class="back-button" onclick="loadCategory('medicaments')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Retour aux classes
            </button>
            ${backToReferrer}
        </div>
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
        'examens-paracliniques': 'Ex. Paracliniques',
        'examens-cliniques': 'Ex. Cliniques',
        'soins-de-plaies': 'Soins de plaies',
        'interventions': 'Interventions',
        'perinatalite-pediatrie': 'Périnatalité & Pédiatrie',
        'recherche': 'Résultat'
    };
    return names[slug] || slug;
}

// Helper to format key names (snake_case to Title Case)
function formatKey(key) {
    if (!key) return '';

    // Custom mappings
    const mappings = {
        'manifestations_cliniques': 'Manifestations Cliniques',
        'examens_diagnostiques': 'Examens diagnostiques',
        'types_avc': 'Types d\'AVC',
        'img': 'Image'
    };

    if (mappings[key]) return mappings[key];

    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
}

// SMART LINKING LOGIC
// SMART LINKING LOGIC
const linkMapping = [
    // Médicaments
    { keywords: ['diurétique', 'diuretique'], target: 'Diurétiques' },
    { keywords: ['bêta-bloquant', 'beta-bloquant', 'bêtabloquant'], target: 'Antihypertenseurs' },
    { keywords: ['ieca', 'iec', 'inhibiteur de l’enzyme de conversion'], target: 'Antihypertenseurs' },
    { keywords: ['ara ii', 'ara 2', 'antagoniste récepteur de l’angiotensine'], target: 'Antihypertenseurs' },
    { keywords: ['bloqueur des canaux calciques', 'inhibiteur calcique'], target: 'Antihypertenseurs' },
    { keywords: ['aspirine', 'aas'], target: 'AAS (Aspirine)' },
    { keywords: ['anticoagulant', 'anticoagulation'], target: 'Anticoagulants' },
    { keywords: ['statine'], target: 'Hypolipidémiants' },
    { keywords: ['diabète', 'diabete', 'antidiabétique', 'antidiabetique'], target: 'Antidiabétiques' },
    { keywords: ['insuline'], target: 'Antidiabétiques' },
    { keywords: ['nitroglycérine', 'nitro', 'nitrates'], target: 'Nitroglycérine (Nitro)' },
    { keywords: ['morphine', 'opioïde', 'opioïden'], target: 'Morphine' },
    { keywords: ['antibiotique'], target: 'Antibiotiques' },
    { keywords: ['lévodopa', 'levodopa', 'sinemet'], target: 'Sinemet' },

    // Examens Cliniques
    { keywords: ['glasgow', 'gcs'], target: 'Échelle de Glasgow (GCS)' },
    { keywords: ['auscultation cardiaque'], target: 'Auscultation Cardiaque' },
    { keywords: ['auscultation pulmonaire'], target: 'Auscultation Pulmonaire' },
    { keywords: ['pqrst', 'douleur (pqrst)'], target: 'Évaluation de la Douleur (PQRST)' },
    { keywords: ['pupille', 'pupillaire'], target: 'Réflexes Pupillaires' },
    { keywords: ['mmse', 'moca'], target: 'Évaluation Cognitive (MMSE/MoCA)' },

    // Examens Paracliniques
    { keywords: ['ecg', 'électrocardiogramme'], target: 'ECG (Électrocardiogramme)' },
    { keywords: ['troponine', 'troponines', 'ck-mb'], target: 'Troponines & CK-MB' },
    { keywords: ['bilan lipidique', 'lipidogramme'], target: 'Lipidogramme' },
    { keywords: ['scanner cérébral', 'scanner cerebral', 'tdm cérébral'], target: 'Scanner (TDM) Cérébral' },
    { keywords: ['scanner thoracique', 'tdm thoracique'], target: 'Scanner (TDM) Thoracique' },
    { keywords: ['bilan hépatique', 'asat', 'alat'], target: 'Bilan Hépatique (ASAT/ALAT)' },
    { keywords: ['inr', 'tca', 'bilan de coagulation'], target: 'Bilan de Coagulation (INR / TCA)' },
    { keywords: ['créatinine', 'creatinine', 'urée'], target: 'Créatinine & Urée' },
    { keywords: ['hba1c'], target: 'HbA1c (Hémoglobine Glyquée)' },
    { keywords: ['gsa', 'gaz sanguins artériels'], target: 'Gaz Sanguins Artériels (GSA)' },
    { keywords: ['hta', 'hypertension'], target: 'HTA (Hypertension Artérielle)' },
    { keywords: ['tvp', 'thrombose veineuse profonde', 'phlébite'], target: 'TVP (Thrombose Veineuse Profonde)' },
    { keywords: ['map', 'maladie artérielle périphérique'], target: 'MAP (Maladie Artérielle Périphérique)' },
    { keywords: ['coronaropathie', 'mcas'], target: 'MCAS' },
    { keywords: ['coronarographie'], target: 'Coronarographie' },
    { keywords: ['doppler', 'échographie doppler'], target: 'Échographie Doppler (Veineuse/Artérielle)' },
    { keywords: ['homans'], target: 'Signe de Homans' },
    { keywords: ['amputation', 'moignon'], target: 'Amputation' },
    { keywords: ['ulcère', 'ulcere'], target: 'Ulcère Veineux' },
    { keywords: ['varice'], target: 'Varices' },

    // Pathologies manquantes
    { keywords: ['avc', 'ischémique', 'ischémie cérébrale'], target: 'AVC (Accident Vasculaire Cérébral)' },
    { keywords: ['alzheimer'], target: 'Alzheimer' },
    { keywords: ['parkinson'], target: 'Parkinson' },
    { keywords: ['sep', 'sclérose en plaques'], target: 'Sclérose en Plaques' },
    { keywords: ['pneumonie'], target: 'Pneumonie' },
    { keywords: ['insuffisance cardiaque'], target: 'Insuffisance Cardiaque' },
    { keywords: ['infarctus', 'sca', 'stemi'], target: 'Infarctus du Myocarde' },
    { keywords: ['diabète', 'diabete'], target: 'Diabète de Type 2' },

    // Interventions
    { keywords: ['angioplastie', 'stent'], target: 'Angioplastie Coronarienne' },
    { keywords: ['pontage', 'pac'], target: 'Pontage Aortocoronarien (PAC)' },
    { keywords: ['thrombectomie'], target: 'Thrombectomie Mécanique' },
    { keywords: ['pth', 'prothèse de hanche', 'prothèse totale de hanche'], target: 'Prothèse Totale de Hanche (PTH)' },
    { keywords: ['lobectomie', 'pneumonectomie'], target: 'Lobectomie / Pneumonectomie' },
    { keywords: ['cataracte', 'cristallin'], target: 'Chirurgie de la Cataracte' },
    { keywords: ['myringotomie', 'diabolo', 'aérateur'], target: 'Myringotomie (Aérateurs)' },
    { keywords: ['pacemaker', 'stimulateur cardiaque'], target: 'Pose de Pacemaker' },
    { keywords: ['endartériectomie', 'carotidienne'], target: 'Endartériectomie Carotidienne' },
    { keywords: ['trachéotomie', 'cannule'], target: 'Trachéotomie' },
    { keywords: ['stripping', 'éveinage'], target: 'Stripping (Éveinage)' },

    // Tégumentaire
    { keywords: ['escarre', 'pression', 'lésion de pression'], target: 'Lésion de pression (Escarre)' },
    { keywords: ['cancer cutané', 'mélanome', 'abcde', 'carcinome'], target: 'Cancer cutané' },

    // Musculosquelettique
    { keywords: ['arthrose', 'coxarthrose', 'gonarthrose'], target: 'Arthrose de la hanche (Coxarthrose)' },
    { keywords: ['ptg', 'prothèse de genou'], target: 'Arthrose du genou (Gonarthrose)' },
    { keywords: ['compartiment', 'syndrome du compartiment'], target: 'Fracture avec déplacement ou écrasement' },
    { keywords: ['plâtre', 'immobilisation'], target: 'Fracture sans déplacement' },

    // Soins de plaies
    { keywords: ['pansement', 'soins de plaies'], target: 'Soins de plaies' },
    { keywords: ['hydrocolloïde', 'duoderm'], target: 'Hydrocolloïde' },
    { keywords: ['alginate', 'aquacel'], target: 'Alginate' },
    { keywords: ['hydrofibre'], target: 'Hydrofibre' },
    { keywords: ['argent', 'antimicrobien', 'biofilm'], target: "Pansement à l'Argent" },
    { keywords: ['hydrogel', 'détersion'], target: 'Hydrogel' },
    { keywords: ['interface', 'mepitel', 'adaptic'], target: 'Pansement Interface' },
    { keywords: ['charbon', 'odeur'], target: 'Charbon Actif' },

    // Multisystémique
    { keywords: ['cancer', 'chimio', 'radio', 'onco', 'tumeur'], target: 'Cancer (Généralités)' },
    { keywords: ['choc septique', 'sepsis'], target: 'Choc Septique' },
    { keywords: ['choc cardiogénique'], target: 'Choc Cardiogénique' },
    { keywords: ['choc hypovolémique', 'hémorragie'], target: 'Choc Hypovolémique' },
    { keywords: ['choc anaphylactique', 'allergie'], target: 'Choc Anaphylactique' },
    { keywords: ['choc neurogénique'], target: 'Choc Neurogénique' },
    { keywords: ['choc obstructif', 'embolie pulmonaire'], target: 'Choc Obstructif' },

    // Soins Critiques
    { keywords: ['intubation', 'ventilation', 'ventilateur', 'bipap'], target: 'Intubation et Ventilation Mécanique' },
    { keywords: ['hémodialyse', 'dialyse', 'fistule'], target: 'Hémodialyse' },
    { keywords: ['phq-9', 'phq9', 'dépression'], target: 'Dépistage de la dépression (PHQ-9)' },

    // Nouveaux sujets Multisystémiques
    { keywords: ['infection nosocomiale', 'sarm', 'erv', 'difficile'], target: 'Infections Nosocomiales' },
    { keywords: ['maladie infectieuse', 'infection', 'sepsis'], target: 'Maladies Infectieuses' },
    { keywords: ['vih', 'sida', 'antirétroviral'], target: "VIH (Virus de l'Immunodéficience Humaine)" },
    { keywords: ['fibrose kystique', 'mucoviscidose'], target: 'Fibrose Kystique (Mucoviscidose)' },
    { keywords: ['croissance', 'retard de croissance', 'anthropométrie'], target: 'Altération de la croissance' },
    { keywords: ['vaccin', 'vaccination', 'immunisation'], target: 'Vaccination' },
    { keywords: ['transfusion', 'produit sanguin', 'culot'], target: 'Transfusion sanguine' },

    // Endocrine
    { keywords: ['diabète type 1', 'diabete type 1'], target: 'Diabète de Type 1' },
    { keywords: ['hypoglycémie', 'hypoglycemie'], target: 'Hypoglycémie (Complication Diabète)' },
    { keywords: ['acidocétose', 'acidocetose', 'acd'], target: 'Acidocétose Diabétique (ACD)' },
    { keywords: ['choc hyperosmolaire', 'shh'], target: 'Syndrome Hyperglycémique Hyperosmolaire (SHH)' },
    { keywords: ['syndrome métabolique', 'syndrome metabolique'], target: 'Syndrome Métabolique' },
    { keywords: ['obésité', 'obesite', 'imc'], target: 'Obésité' },
    { keywords: ['thyroïde', 'thyroide', 'goitre'], target: 'Auscultation de la Thyroïde' },
    { keywords: ['hypothyroïdie', 'hypothyroidie', 'levothyroxine'], target: 'Hypothyroïdie' },
    { keywords: ['hyperthyroïdie', 'hyperthyroidie', 'basedow'], target: 'Hyperthyroïdie' },
    { keywords: ['thyroïdectomie', 'thyroidectomie'], target: 'Thyroïdectomie' },

    // Gastro-intestinal
    { keywords: ['mici', 'crohn', 'colite'], target: "Maladies Inflammatoires Chroniques de l'Intestin (MICI)" },
    { keywords: ['occlusion', 'iléus', 'ileus'], target: 'Occlusion Intestinale' },
    { keywords: ['cancer colorectal', 'côlon', 'colon', 'rectum'], target: 'Cancer Colorectal' },
    { keywords: ['cholécystite', 'cholecystite', 'vésicule', 'vesicule', 'biliaire'], target: 'Cholécystite' },
    { keywords: ['péritonite', 'peritonite'], target: 'Péritonite' },
    { keywords: ['chirurgie gi', 'résection', 'resection', 'anastomose'], target: 'Chirurgie Gastro-intestinale (Résection)' },
    { keywords: ['stomie', 'iléostomie', 'colostomie', 'poche'], target: 'Stomies (Iléostomie & Colostomie)' },
    { keywords: ['cholécystectomie', 'cholecystectomie'], target: 'Cholécystectomie' },

    // Urinaire
    { keywords: ['infection urinaire', 'cystite', 'pyélonéphrite'], target: 'Infection Urinaire' },
    { keywords: ['insuffisance rénale aiguë', 'ira'], target: 'Insuffisance Rénale Aiguë (IRA)' },
    { keywords: ['insuffisance rénale chronique', 'irc'], target: 'Insuffisance Rénale Chronique (IRC)' },
    { keywords: ['incontinence', 'vessie'], target: 'Incontinence Urinaire' },

    // Reproducteur
    { keywords: ['itss'], target: 'ITSS (Infections Transmissibles Sexuellement et par le Sang)' },
    { keywords: ['chlamydia'], target: 'Chlamydia' },
    { keywords: ['gonorrhée', 'gonorrhee'], target: 'Gonorrhée' },
    { keywords: ['syphilis'], target: 'Syphilis' },
    { keywords: ['vph', 'papillome', 'verrue génitale'], target: 'VPH (Virus du Papillome Humain)' },
    { keywords: ['herpès', 'herpes', 'vésicule génitale'], target: 'Herpès Génital' },
    { keywords: ['endométriose', 'fibrome', 'kyste ovarien'], target: 'Troubles Bénins (Féminin)' },
    { keywords: ['cancer du col', 'paptest'], target: "Cancer du Col de l'Utérus" },
    { keywords: ['cancer de l\'utérus', 'endomètre', 'saignement post-ménopause'], target: "Cancer de l'Utérus (Endomètre)" },
    { keywords: ['cancer de l\'ovaire', 'ovaire'], target: "Cancer de l'Ovaire" },
    { keywords: ['cancer du sein', 'sein', 'mammographie', 'masse mammaire'], target: 'Cancer du Sein' },
    { keywords: ['hbp', 'prostate', 'hyperplasie'], target: 'Hyperplasie Bénigne de la Prostate (HBP)' },
    { keywords: ['cancer de la prostate', 'aps', 'toucher rectal'], target: 'Cancer de la Prostate' },
    { keywords: ['hystérectomie', 'hysterectomie', 'ablation utérus'], target: 'Hystérectomie' },
    { keywords: ['mastectomie', 'lymphoedème', 'drainage lymphatique'], target: 'Mastectomie Radicale Modifiée' },
    { keywords: ['tumorectomie'], target: 'Tumorectomie (Sein)' },
    { keywords: ['turp', 'résection prostate', 'irrigation vésicale'], target: 'Résection Transurétrale de la Prostate (TURP)' },
    { keywords: ['prostatectomie'], target: 'Prostatectomie Radicale' },

    // Gazométrie / Acido-basique
    { keywords: ['acidose respiratoire'], target: 'Acidose Respiratoire' },
    { keywords: ['alcalose respiratoire'], target: 'Alcalose Respiratoire' },
    { keywords: ['acidose métabolique', 'acidocétose'], target: 'Acidose Métabolique' },
    { keywords: ['alcalose métabolique'], target: 'Alcalose Métabolique' },

    // Périnatalité et Pédiatrie
    { keywords: ['apgar'], target: 'Score d\'Apgar' },
    { keywords: ['reflexe archaïque', 'morou', 'babinski'], target: 'Réflexes archaïques' },
    { keywords: ['ictère', 'ictere', 'jaunisse'], target: 'Ictère néonatal' },
    { keywords: ['allaitement', 'sein'], target: 'Allaitement maternel' },
    { keywords: ['croissance', 'pediatrie', 'pédiatrie'], target: 'Constantes vitales pédiatriques' }
];

function formatSmartLinks(text) {
    if (typeof text !== 'string') return text;

    // Helper to escape HTML characters
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // 1. Identify all potential matches across the whole text (using original unescaped text)
    const matches = [];
    linkMapping.forEach(link => {
        link.keywords.forEach(keyword => {
            // Escape special regex characters in the keyword
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // IMPROVED REGEX:
            // 1. Matches preceded by start of string, whitespace, OR apostrophe/quote (for l'HTA)
            // 2. Matches the keyword (case insensitive)
            // 3. Optional plural 's' or 'x'
            // 4. Followed by end of string, whitespace, or punctuation
            // We use lookbehind/lookahead logic or simple boundary checks.
            // Since JS lookbehind support varies, we stick to \b but ' is a word boundary.

            // 'HTA' is \bHTA\b. 
            // "l'HTA" -> ' is non-word char, H is word char. So \b matches between ' and H.
            // This logic works for standard words.

            const regex = new RegExp('(\\b' + escapedKeyword + '[s|x]?\\b)', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    target: link.target
                });
            }
        });
    });

    if (matches.length === 0) return escapeHtml(text);

    // 2. Filter matches to avoid overlaps (favoring longer ones)
    matches.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);

    const selectedMatches = [];
    const usedIndices = new Array(text.length).fill(false);

    for (const match of matches) {
        let overlap = false;
        for (let i = match.start; i < match.end; i++) {
            if (usedIndices[i]) {
                overlap = true;
                break;
            }
        }

        if (!overlap) {
            selectedMatches.push(match);
            for (let i = match.start; i < match.end; i++) {
                usedIndices[i] = true;
            }
        }
    }

    // 4. Sort selected matches by start position for reconstruction
    selectedMatches.sort((a, b) => a.start - b.start);

    // 5. Build result string from fragments with ESCAPING
    let result = '';
    let lastIndex = 0;

    selectedMatches.forEach(match => {
        // Escape the text BEFORE the match
        result += "<div>" + escapeHtml(text.slice(lastIndex, match.start));

        const escapedTarget = match.target.replace(/'/g, "\\'");

        // Check if this specific link should be non-breaking (e.g. short acronyms like HTA)
        const isShortAcronym = ['HTA', 'AVC', 'IVG', 'IMG', 'AAS', 'IEC', 'ARA', 'VPH', 'GCS', 'ECG'].includes(match.text.toUpperCase());
        const extraClass = isShortAcronym ? ' no-break' : '';

        // The match text itself is also escaped just in case, though usually safe
        result += `<span class="smart-link${extraClass}" onclick="handleSmartLink(this.textContent, '${escapedTarget}')">${escapeHtml(match.text)}</span>`;
        lastIndex = match.end;
    });

    // Escape the remaining text
    result += escapeHtml(text.slice(lastIndex)) + "</div>";
    return result;
}

function handleSmartLink(originalText, targetName) {
    if (!targetName) return;
    const target = targetName.trim().toLowerCase();

    // Normalize spaces and special characters for matching
    const normalizedTarget = target.replace(/\s+/g, ' ');

    // Strategy: Find the target anywhere in studyData
    let foundItem = null;

    for (const cat of categories) {
        if (studyData[cat]) {
            // Priority 1: Exact Match (ignoring case/spaces)
            foundItem = studyData[cat].find(item => {
                const title = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
                return title === normalizedTarget;
            });

            // Priority 2: Title includes target
            if (!foundItem) {
                foundItem = studyData[cat].find(item => {
                    const title = item.title.toLowerCase().replace(/\s+/g, ' ');
                    return title.includes(normalizedTarget);
                });
            }

            // Priority 3: Target includes title
            if (!foundItem) {
                foundItem = studyData[cat].find(item => {
                    const title = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
                    return normalizedTarget.includes(title);
                });
            }

            if (foundItem) break;
        }
    }

    if (foundItem) {
        // Scroll to top if already open
        if (currentModalItem && currentModalItem.id === foundItem.id) {
            const modalBody = document.getElementById('modal-body');
            if (modalBody) modalBody.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => openModal(foundItem), 100);
        return;
    }

    // 2. If no exact item, maybe it's a Medication Class
    const allMedData = studyData['medicaments'];
    if (allMedData) {
        const distinctClasses = [...new Set(allMedData.map(m => m.details.classe))];
        const matchedClass = distinctClasses.find(c => c.toLowerCase().includes(target));

        if (matchedClass) {
            const savedItem = currentModalItem; // Capture before closeModal clears it
            closeModal();
            loadCategory('medicaments');
            referringItem = savedItem; // Set after loadCategory might have cleared it

            setTimeout(() => {
                renderMedicationsByClass(matchedClass, allMedData);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            return;
        }
    }

    // 3. Fallback: Search for that term
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const savedItem = currentModalItem; // Capture before closeModal clears it
        closeModal();
        referringItem = savedItem;

        searchInput.value = targetName;
        searchInput.dispatchEvent(new Event('input'));
    }
}

// Open Modal with Details
function openModal(item, isBack = false) {
    // Handle history
    if (!isBack && currentModalItem && currentModalItem.id !== item.id) {
        modalHistory.push(currentModalItem);
    }
    currentModalItem = item;

    // Get color class for category label
    let labelClass = 'bg-pathology';
    if (item.category === 'medicaments') labelClass = 'bg-medicament';
    else if (item.category === 'interventions') labelClass = 'bg-intervention';
    else if (item.category === 'examens-paracliniques') labelClass = 'bg-para';
    else if (item.category === 'examens-cliniques') labelClass = 'bg-clinic';
    else if (item.category === 'soins-de-plaies') labelClass = 'bg-wound';
    else if (item.category === 'perinatalite-pediatrie') labelClass = 'bg-peri';

    let contentHtml = '';

    // Add back button if history exists
    if (modalHistory.length > 0) {
        const previousItem = modalHistory[modalHistory.length - 1];
        contentHtml += `
            <button class="modal-back-button" onclick="goBackInModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Retour à : ${previousItem.title}
            </button>
        `;
    }

    // Header with Interactive Badges
    let badgesHtml = `<div class="card-category-label ${labelClass} clickable" onclick="navigateToCategory('${item.category}')">${formatCategoryName(item.category)}</div>`;

    // Add System badge for pathologies
    if (item.category === 'pathologies' && item.systeme) {
        badgesHtml += `<div class="card-category-label bg-pathology clickable" onclick="navigateToSystem('${item.systeme.replace(/'/g, "\\'")}', 'pathologies')">Système : ${item.systeme}</div>`;
    }

    // Add Class badge for medications
    if (item.category === 'medicaments' && item.details.classe) {
        badgesHtml += `<div class="card-category-label bg-medicament clickable" onclick="navigateToMedicationClass('${item.details.classe.replace(/'/g, "\\'")}')">${item.details.classe}</div>`;
    }

    contentHtml += `
        <div class="detail-header">
            <h2 class="detail-title">${item.title}</h2>
            <div class="detail-header-badges">
                ${badgesHtml}
            </div>
        </div>
        <div class="detail-body">
    `;

    // Dynamically generate details based on keys
    // Define preferred order of sections
    const keyOrder = ['definition', 'types', 'types_avc', 'types_ic', 'manifestations_cliniques', 'examens_diagnostiques', 'traitements', 'surveillance', 'complications'];

    // Get all keys from the item
    const itemKeys = Object.keys(item.details);

    // Sort keys based on preferred order (unlisted keys go to the end)
    itemKeys.sort((a, b) => {
        const indexA = keyOrder.indexOf(a);
        const indexB = keyOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    for (const key of itemKeys) {
        // Skip grouping-only fields and special fields handled separately
        if (key === 'classe' || key === 'sous_classe' || key === 'images' || key === 'liens') continue;

        let value = item.details[key];

        // Check for special image object (like illustration_coeur)
        if (value && typeof value === 'object' && value.type === 'image' && !Array.isArray(value)) {
            contentHtml += `
                <div class="detail-section detail-image-container">
                    <h3 class="detail-image-title">${value.title}</h3>
                    <img src="${value.url}" alt="${value.title}" class="detail-flexible-image">
                </div>
            `;
            continue;
        }

        contentHtml += `<div class="detail-section">`;
        contentHtml += `<h3>${formatKey(key)}</h3>`;

        // Special handling for nested AVC types structure
        if (key === 'types_avc' && typeof value === 'object' && !Array.isArray(value)) {
            for (const typeKey in value) {
                const typeData = value[typeKey];
                const typeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

                contentHtml += `<div style="margin-bottom: 1.5rem;">`;
                contentHtml += `<strong style="color: var(--accent-color); font-size: 1.05em;">${typeName}</strong>`;
                if (typeData.description) {
                    contentHtml += `<p style="margin: 0.5rem 0; font-style: italic;">${formatSmartLinks(typeData.description)}</p>`;
                }
                if (typeData.sous_types && Array.isArray(typeData.sous_types)) {
                    contentHtml += `<ul style="margin-top: 0.5rem;">`;
                    typeData.sous_types.forEach(subType => {
                        contentHtml += `<li>${formatSmartLinks(subType)}</li>`;
                    });
                    contentHtml += `</ul>`;
                }
                contentHtml += `</div>`;
            }
        }
        // Special handling for Heart Failure types (Left vs Right)
        else if (key === 'types_ic' && typeof value === 'object' && !Array.isArray(value)) {
            for (const typeKey in value) {
                const typeData = value[typeKey];
                // typeKey is likely "gauche" or "droite"
                const typeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

                contentHtml += `<div style="margin-bottom: 1.5rem;">`;
                contentHtml += `<strong style="color: var(--accent-color); font-size: 1.05em;">Insuffisance Cardiaque ${typeName}</strong>`;

                if (typeData.description) {
                    contentHtml += `<p style="margin: 0.5rem 0;">${formatSmartLinks(typeData.description)}</p>`;
                }

                if (typeData.symptomes && Array.isArray(typeData.symptomes)) {
                    contentHtml += `<ul style="margin-top: 0.5rem;">`;
                    typeData.symptomes.forEach(symptome => {
                        contentHtml += `<li>${formatSmartLinks(symptome)}</li>`;
                    });
                    contentHtml += `</ul>`;
                }
                contentHtml += `</div>`;
            }
        }
        else if (Array.isArray(value)) {
            contentHtml += `<ul>`;
            value.forEach(point => {
                contentHtml += `<li>${formatSmartLinks(point)}</li>`;
            });
            contentHtml += `</ul>`;
        } else {
            contentHtml += `<p>${formatSmartLinks(value)}</p>`;
        }
        contentHtml += `</div>`;
    }

    // External Links Section
    if (item.details.liens && item.details.liens.length > 0) {
        contentHtml += `<div class="detail-section external-resources">`;
        contentHtml += `<h3>Ressources & Guides Externes</h3>`;
        contentHtml += `<div class="external-links-container">`;
        item.details.liens.forEach(link => {
            contentHtml += `
                <a href="${link.url}" target="_blank" class="external-link-card">
                    <div class="external-link-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </div>
                    <span>${link.titre}</span>
                </a>
            `;
        });
        contentHtml += `</div></div>`;
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
    // Clear history on full close
    modalHistory = [];
    currentModalItem = null;
}

// Open Referrer (Back to Pathology)
function openReferrer() {
    if (referringItem) {
        const itemToOpen = referringItem;
        referringItem = null; // Clear it so it doesn't persist
        openModal(itemToOpen);

        // Optionally refresh the view to hdie the button immediately 
        // if the modal is closed later, but opening modal is priority
    }
}

// Back in Modal logic
function goBackInModal() {
    if (modalHistory.length > 0) {
        const previousItem = modalHistory.pop();
        openModal(previousItem, true);
    }
}

// NAVIGATION HELPERS (Category/System/Class)
function navigateToCategory(category) {
    closeModal();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    loadCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToSystem(systemName, category) {
    closeModal();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Ensure we are on the right category tab
    currentCategory = category;
    updateActiveTab(category);

    // Render filtered by system
    if (studyData[category]) {
        renderPathologiesBySystem(systemName, studyData[category]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function navigateToMedicationClass(className) {
    closeModal();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Ensure we are on the right category tab
    currentCategory = 'medicaments';
    updateActiveTab('medicaments');

    // Render filtered by class
    if (studyData['medicaments']) {
        renderMedicationsByClass(className, studyData['medicaments']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

                // Sort all search results alphabetically
                allResults.sort((a, b) => a.title.localeCompare(b.title));

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
    const sourcesData = studyData['sources'];
    if (!sourcesData) {
        console.error('Sources non chargées');
        return;
    }
    openModal(sourcesData);
}

// Run
document.addEventListener('DOMContentLoaded', init);

// Blood Gas Analysis (Gazométrie) Functionality
function renderGazometrie() {
    contentArea.innerHTML = `
        <div class="calculator-container">
            <div class="calculator-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <h2>Analyseur de Gaz Sanguins</h2>
                <p>Entrez les valeurs pour obtenir une interprétation du désordre acido-basique.</p>
            </div>
            
            <div class="calculator-form">
                <div class="form-group">
                    <label for="ph-input">pH (Acidité)</label>
                    <div class="input-with-unit">
                        <input type="number" id="ph-input" step="0.01" placeholder="7.35 - 7.45">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="paco2-input">PaCO2 (Pression Partielle CO2)</label>
                    <div class="input-with-unit">
                        <input type="number" id="paco2-input" step="1" placeholder="35 - 45">
                        <span class="input-unit">mmHg</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="hco3-input">HCO3- (Bicarbonates)</label>
                    <div class="input-with-unit">
                        <input type="number" id="hco3-input" step="1" placeholder="22 - 26">
                        <span class="input-unit">mmol/L</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="eb-input">EB / BE (Excès de base)</label>
                    <div class="input-with-unit">
                        <input type="number" id="eb-input" step="0.1" placeholder="-2 à +2">
                        <span class="input-unit">mEq/L</span>
                    </div>
                </div>
                
                <button class="interpret-btn" onclick="interpretBloodGas()">Interpréter les résultats</button>
            </div>
            
            <div id="gaz-results" class="results-area" style="display: none;">
                <!-- Results will be injected here -->
            </div>
        </div>
    `;
}

function interpretBloodGas() {
    const ph = parseFloat(document.getElementById('ph-input').value);
    const paco2 = parseFloat(document.getElementById('paco2-input').value);
    const hco3 = parseFloat(document.getElementById('hco3-input').value);
    const eb = parseFloat(document.getElementById('eb-input').value);
    const resultsArea = document.getElementById('gaz-results');

    if (isNaN(ph) || isNaN(paco2) || isNaN(hco3) || isNaN(eb)) {
        alert("Veuillez entrer toutes les valeurs (pH, PaCO2, HCO3- et Excès de base).");
        return;
    }

    resultsArea.style.display = 'block';

    let state = ""; // Acidose, Alcalose, Normal
    let type = "";  // Respiratoire, Métabolique
    let compensation = "Absente";
    let statusClass = "type-normal";
    let explanation = "";

    // Normals
    const phMin = 7.35, phMax = 7.45;
    const paco2Min = 35, paco2Max = 45;
    const hco3Min = 22, hco3Max = 26;
    const ebMin = -2, ebMax = 2;

    // 1. Determine primary state
    if (ph < phMin) {
        state = "Acidose";
        statusClass = "type-acidosis";
    } else if (ph > phMax) {
        state = "Alcalose";
        statusClass = "type-alkalosis";
    } else {
        state = "Normal";
        statusClass = "type-normal";
    }

    // 2. Determine cause and compensation
    if (state !== "Normal") {
        const isRespCause = (state === "Acidose" && paco2 > paco2Max) || (state === "Alcalose" && paco2 < paco2Min);
        const isMetaCause = (state === "Acidose" && (hco3 < hco3Min || eb < ebMin)) || (state === "Alcalose" && (hco3 > hco3Max || eb > ebMax));

        if (isRespCause) {
            type = "Respiratoire";
            // Check for metabolic compensation
            if (state === "Acidose") {
                if (hco3 > hco3Max || eb > ebMax) compensation = "Partielle";
            } else {
                if (hco3 < hco3Min || eb < ebMin) compensation = "Partielle";
            }
        } else if (isMetaCause) {
            type = "Métabolique";
            // Check for respiratory compensation
            if (state === "Acidose") {
                if (paco2 < paco2Min) compensation = "Partielle";
            } else {
                if (paco2 > paco2Max) compensation = "Partielle";
            }
        } else {
            // Mixed or complex
            type = "Inconnu (Désordre mixte possible)";
        }
    } else {
        // pH is normal, but check if there's full compensation
        const isRespAcid = paco2 > paco2Max && (hco3 > hco3Max || eb > ebMax);
        const isMetaAcid = (hco3 < hco3Min || eb < ebMin) && paco2 < paco2Min;
        const isRespAlk = paco2 < paco2Min && (hco3 < hco3Min || eb < ebMin);
        const isMetaAlk = (hco3 > hco3Max || eb > ebMax) && paco2 > paco2Max;

        if (isRespAcid || isMetaAcid || isRespAlk || isMetaAlk) {
            compensation = "Complète";
            if (ph < 7.40) {
                state = "Acidose";
                statusClass = "type-acidosis";
                type = isRespAcid ? "Respiratoire" : "Métabolique";
            } else if (ph > 7.40) {
                state = "Alcalose";
                statusClass = "type-alkalosis";
                type = isRespAlk ? "Respiratoire" : "Métabolique";
            } else {
                state = "Normal (Équilibré)";
                type = "Aucun";
                compensation = "N/A";
            }
        } else {
            type = "Aucun";
            compensation = "N/A";
            explanation = "Toutes les valeurs sont dans les limites de la normale.";
        }
    }

    let clinicalInfo = {
        description: "",
        surveillance: []
    };

    if (state === "Acidose" && type === "Respiratoire") {
        clinicalInfo.description = "Accumulation de CO2 due à une hypoventilation. Le corps retient trop de gaz carbonique.";
        clinicalInfo.surveillance = ["Fréquence respiratoire", "État de conscience (narcose au CO2)", "Saturation O2"];
    } else if (state === "Alcalose" && type === "Respiratoire") {
        clinicalInfo.description = "Élimination excessive de CO2 due à une hyperventilation (anxiété, douleur, fièvre).";
        clinicalInfo.surveillance = ["Signes de tétanie (picotements)", "Rythme respiratoire", "Niveau d'anxiété"];
    } else if (state === "Acidose" && type === "Métabolique") {
        clinicalInfo.description = "Excès d'acides ou perte de bicarbonates (insuffisance rénale, acidocétose, diarrhées).";
        clinicalInfo.surveillance = ["Respiration de Kussmaul", "Électrolytes (Potassium)", "Hydratation"];
    } else if (state === "Alcalose" && type === "Métabolique") {
        clinicalInfo.description = "Perte d'acides (vomissements, succion gastrique) ou gain de bicarbonates.";
        clinicalInfo.surveillance = ["Signes d'hypokaliémie", "Amplitude respiratoire", "Réflexes musculaires"];
    }

    if (!explanation) {
        explanation = `Le patient présente une <strong class="smart-link" onclick="handleSmartLink(this.textContent, '${state} ${type}')">${state} ${type.toLowerCase()}</strong> avec une compensation <strong>${compensation.toLowerCase()}</strong>.`;
    }

    let surveillanceHtml = "";
    if (clinicalInfo.surveillance.length > 0) {
        surveillanceHtml = `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                <strong style="color: var(--primary-color); font-size: 0.9rem;">À surveiller :</strong>
                <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.9rem; color: var(--text-color);">
                    ${clinicalInfo.surveillance.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    resultsArea.innerHTML = `
        <div class="result-card">
            <div class="result-type ${statusClass}">${state} ${type}</div>
            <div class="result-main">${state} ${type !== "Aucun" ? type : ""}</div>
            <p class="result-explanation">${explanation}</p>
            ${clinicalInfo.description ? `<p style="font-size: 0.95rem; margin-top: 0.5rem; color: var(--text-muted);">${clinicalInfo.description}</p>` : ''}
            
            ${surveillanceHtml}

            <div class="results-grid four-items">
                <div class="result-item">
                    <div class="result-label">pH</div>
                    <div class="result-value">${ph.toFixed(2)}</div>
                    <div class="result-status ${ph < phMin ? 'status-low' : (ph > phMax ? 'status-high' : 'status-normal')}">
                        ${ph < phMin ? 'Bas' : (ph > phMax ? 'Élevé' : 'Normal')}
                    </div>
                </div>
                <div class="result-item">
                    <div class="result-label">PaCO2</div>
                    <div class="result-value">${paco2}</div>
                    <div class="result-status ${paco2 < paco2Min ? 'status-low' : (paco2 > paco2Max ? 'status-high' : 'status-normal')}">
                        ${paco2 < paco2Min ? 'Bas' : (paco2 > paco2Max ? 'Élevé' : 'Normal')}
                    </div>
                </div>
                <div class="result-item">
                    <div class="result-label">HCO3-</div>
                    <div class="result-value">${hco3}</div>
                    <div class="result-status ${hco3 < hco3Min ? 'status-low' : (hco3 > hco3Max ? 'status-high' : 'status-normal')}">
                        ${hco3 < hco3Min ? 'Bas' : (hco3 > hco3Max ? 'Élevé' : 'Normal')}
                    </div>
                </div>
                <div class="result-item">
                    <div class="result-label">Excès de base</div>
                    <div class="result-value">${eb > 0 ? '+' : ''}${eb}</div>
                    <div class="result-status ${eb < ebMin ? 'status-low' : (eb > ebMax ? 'status-high' : 'status-normal')}">
                        ${eb < ebMin ? 'Bas' : (eb > ebMax ? 'Élevé' : 'Normal')}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
                Note : Compensation ${compensation}. L'Excès de Base (EB) aide à confirmer la composante métabolique. Cliquez sur l'interprétation pour voir la fiche complète.
            </div>
        </div>
    `;

    // Smooth scroll to results
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

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
