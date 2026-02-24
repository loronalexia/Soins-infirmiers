import { keyOrder } from './config.js';
import { formatKey } from './utils.js';
import { formatSmartLinks } from './smart-links.js';

// Modal Elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// Modal Navigation History
let currentModalItem = null;
let modalHistory = [];
let referringItem = null;

export function openModal(item, isBack = false) {
    if (!item) return;

    // Manage history
    if (!isBack && currentModalItem) {
        modalHistory.push(currentModalItem);
    }
    currentModalItem = item;

    // Determine referring item for specific "Back" cases (e.g., Med to Pathology)
    referringItem = (modalHistory.length > 0) ? modalHistory[0] : null;

    modalBody.innerHTML = '';
    const details = item.details || {};

    let contentHtml = `
        <div class="detail-header">
            <div class="detail-header-badges">
                <span class="card-category-label bg-${item.category.slice(0, 4)}">${item.category}</span>
                ${details.classe ? `<span class="card-category-label bg-medicament">${details.classe}</span>` : ''}
            </div>
            <h2 class="detail-title">${item.title}</h2>
            <div class="header-nav-group">
                ${modalHistory.length > 0 ? `<button class="back-button" id="modal-back-btn">← Retour</button>` : ''}
                ${(item.category === 'medicaments' && referringItem && referringItem.category === 'pathologies') ?
            `<button class="back-button referrer-back" id="referrer-back-btn">← Revenir à : ${referringItem.title}</button>` : ''}
            </div>
        </div>`;

    // Visuals (Images)
    if (item.images && item.images.length > 0) {
        contentHtml += `<div class="gallery-container">`;
        item.images.forEach(img => {
            contentHtml += `
                <div class="gallery-item">
                    <img src="${img.url}" alt="${img.title}" class="detail-flexible-image">
                    <span class="comparison-caption">${img.title}</span>
                </div>`;
        });
        contentHtml += `</div>`;
    }

    // Dynamic detail fields
    keyOrder.forEach(key => {
        if (!details[key]) return;

        const value = details[key];
        contentHtml += `<div class="detail-section">`;
        contentHtml += `<h3>${formatKey(key)}</h3>`;

        // Special handling for nested Nursing Care structure
        if (key === 'soins_infirmiers' && typeof value === 'object' && !Array.isArray(value)) {
            for (const subKey in value) {
                const subValue = value[subKey];
                contentHtml += `<div class="nursing-subsection">`;
                contentHtml += `<h4>${formatKey(subKey)}</h4>`;

                if (Array.isArray(subValue)) {
                    contentHtml += `<ul>`;
                    subValue.forEach(point => {
                        contentHtml += `<li>${formatSmartLinks(point)}</li>`;
                    });
                    contentHtml += `</ul>`;
                } else {
                    contentHtml += `<p>${formatSmartLinks(subValue)}</p>`;
                }
                contentHtml += `</div>`;
            }
        }
        // Special handling for nested AVC types structure
        else if (key === 'types_avc' && typeof value === 'object' && !Array.isArray(value)) {
            for (const typeKey in value) {
                const typeData = value[typeKey];
                const typeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
                contentHtml += `<div class="nursing-subsection">`;
                contentHtml += `<h4>Type ${typeName}</h4>`;
                contentHtml += `<p><strong>Description :</strong> ${formatSmartLinks(typeData.description)}</p>`;
                if (typeData.sous_types) {
                    contentHtml += `<ul style="margin-top:10px;">`;
                    typeData.sous_types.forEach(st => {
                        contentHtml += `<li>${formatSmartLinks(st)}</li>`;
                    });
                    contentHtml += `</ul>`;
                }
                contentHtml += `</div>`;
            }
        }
        // Special handling for nested IC types structure
        else if (key === 'types_ic' && typeof value === 'object' && !Array.isArray(value)) {
            for (const typeKey in value) {
                const typeData = value[typeKey];
                const typeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
                contentHtml += `<div class="nursing-subsection">`;
                contentHtml += `<h4>IC ${typeName}</h4>`;
                contentHtml += `<p><strong>Description :</strong> ${formatSmartLinks(typeData.description)}</p>`;
                if (typeData.symptomes) {
                    contentHtml += `<ul style="margin-top:10px;">`;
                    typeData.symptomes.forEach(s => {
                        contentHtml += `<li>${formatSmartLinks(s)}</li>`;
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
        } else if (typeof value === 'object') {
            // Generic object fallback
            contentHtml += `<ul>`;
            for (const subKey in value) {
                contentHtml += `<li><strong>${formatKey(subKey)} :</strong> ${formatSmartLinks(value[subKey])}</li>`;
            }
            contentHtml += `</ul>`;
        } else {
            contentHtml += `<p>${formatSmartLinks(value)}</p>`;
        }

        // Specific illustration for IC scheme
        if (key === 'definition' && details.illustration_coeur) {
            contentHtml += `
                <div class="gallery-item" style="margin: 20px 0;">
                    <img src="assets/inscardiaque.jpg" class="detail-flexible-image">
                    <span class="comparison-caption">Structure de l'insuffisance cardiaque</span>
                </div>`;
        }

        contentHtml += `</div>`;
    });

    // Handle Links/Sources
    if (item.liens && item.liens.length > 0) {
        contentHtml += `
            <div class="external-resources">
                <h3>Ressources Externes</h3>
                <div class="external-links-container">`;
        item.liens.forEach(link => {
            contentHtml += `
                    <a href="${link.url}" target="_blank" class="external-link-card">
                        <div class="external-link-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </div>
                        ${link.titre || 'Voir la ressource'}
                    </a>`;
        });
        contentHtml += `</div></div>`;
    }

    modalBody.innerHTML = contentHtml;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Event listeners for modal buttons
    const backBtn = document.getElementById('modal-back-btn');
    if (backBtn) backBtn.addEventListener('click', goBackInModal);

    const refBtn = document.getElementById('referrer-back-btn');
    if (refBtn) refBtn.addEventListener('click', openReferrer);
}

export function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    modalHistory = [];
    currentModalItem = null;
    referringItem = null;
}

export function openReferrer() {
    if (referringItem) {
        modalHistory = []; // Reset history to avoid loops
        openModal(referringItem, true);
    }
}

export function goBackInModal() {
    if (modalHistory.length > 0) {
        const prevItem = modalHistory.pop();
        openModal(prevItem, true);
    }
}
