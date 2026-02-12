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
const categories = ['pathologies', 'medicaments', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies', 'interventions'];

// Modal Navigation History
let currentModalItem = null;
let modalHistory = [];
let referringItem = null; // Track item that triggered a cross-view link

// Global Constants
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
        // Categories for main navigation
        const mainCategories = ['pathologies', 'medicaments', 'interventions', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies'];
        // All files to load (including invisible ones like sources)
        const filesToLoad = [...mainCategories, 'sources'];

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
        'recherche': 'Résultat'
    };
    return names[slug] || slug;
}

// Helper to format key names (snake_case to Title Case)
function formatKey(key) {
    if (!key) return '';
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
    { keywords: ['prostatectomie'], target: 'Prostatectomie Radicale' }
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
        result += escapeHtml(text.slice(lastIndex, match.start));

        const escapedTarget = match.target.replace(/'/g, "\\'");
        // The match text itself is also escaped just in case, though usually safe
        result += `<span class="smart-link" onclick="handleSmartLink(this.textContent, '${escapedTarget}')">${escapeHtml(match.text)}</span>`;
        lastIndex = match.end;
    });

    // Escape the remaining text
    result += escapeHtml(text.slice(lastIndex));
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
    for (const key in item.details) {
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
