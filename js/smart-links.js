import { linkMapping } from './config.js';
import { studyData } from './data-service.js';

export function formatSmartLinks(text) {
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

    // 1. Initial escape to avoid HTML issues
    let result = escapeHtml(text);

    // 2. Prepare a list of all unique keywords and their targets
    const keywordsMap = new Map();
    linkMapping.forEach(mapping => {
        mapping.keywords.forEach(kw => {
            // Priority: keep the first target encountered, or could be longest keyword first
            if (!keywordsMap.has(kw.toLowerCase())) {
                keywordsMap.set(kw.toLowerCase(), mapping.target);
            }
        });
    });

    // Sort keywords by length descending (match "insuffisance cardiaque" before "cardiaque")
    const sortedKeywords = Array.from(keywordsMap.keys()).sort((a, b) => b.length - a.length);

    if (sortedKeywords.length === 0) return result;

    // 3. Construct a single regex to find all keywords at once
    // This prevents double-wrapping/nesting
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexSource = sortedKeywords.map(kw => `\\b${escapeRegex(kw)}s?\\b`).join('|');
    const globalRegex = new RegExp(regexSource, 'gi');

    // 4. Perform a single pass replacement
    result = result.replace(globalRegex, (match) => {
        const target = keywordsMap.get(match.toLowerCase()) ||
            keywordsMap.get(match.toLowerCase().replace(/s$/, '')); // Try plural match

        if (target) {
            return `<span class="smart-link" data-target="${target}">${match}</span>`;
        }
        return match;
    });

    return result;
}

export function handleSmartLink(targetName) {
    console.log('Searching for smart link target:', targetName);

    // 1. Check if it's a Medication Class (Sub-category in data)
    if (studyData['medicaments']) {
        const isMedClass = studyData['medicaments'].some(m => {
            const cl = (m.details.classe || '').toLowerCase();
            const sc = (m.details.sous_classe || '').toLowerCase();
            const tn = targetName.toLowerCase();
            return cl === tn || cl.includes(tn) || sc === tn || sc.includes(tn);
        });
        if (isMedClass) {
            import('./navigation.js').then(nav => {
                nav.navigateToMedicationClass(targetName);
            });
            return;
        }
    }

    // 2. Search across all data for specific item
    for (const category in studyData) {
        if (Array.isArray(studyData[category])) {
            const found = studyData[category].find(item =>
                item.title.toLowerCase() === targetName.toLowerCase()
            );

            if (found) {
                window.openModal(found);
                return;
            }
        }
    }

    // Special case for "Soins de plaies" general link
    if (targetName === 'Soins de plaies') {
        const navPlaies = document.querySelector('[data-category="soins-de-plaies"]');
        if (navPlaies) navPlaies.click();
        return;
    }

    console.warn('Smart link target not found:', targetName);
}
