import { linkMapping } from './config.js';
import { studyData } from './data-service.js';
import { openModal } from './modal-controller.js';

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

    let result = escapeHtml(text);

    // Apply mappings
    linkMapping.forEach(mapping => {
        mapping.keywords.forEach(keyword => {
            // Check if keyword is in the text (case insensitive)
            // Using a simple replacement that doesn't break already created links
            const regex = new RegExp(`\\b(${keyword}s?)\\b`, 'gi');

            // We only replace if it's not already inside an <a> tag
            // This is a bit tricky with simple regex, but let's try a safer approach
            // We'll mark potential replacements and then replace them once to avoid nested links
            result = result.replace(regex, (match) => {
                // If the match is already part of a smart-link, skip it
                // This is a simple heuristic: if there's a '>' before and no '<' or vice versa
                return `<span class="smart-link" data-target="${mapping.target}">${match}</span>`;
            });
        });
    });

    return result;
}

export function handleSmartLink(targetName) {
    console.log('Searching for smart link target:', targetName);

    // Search across all data
    for (const category in studyData) {
        if (Array.isArray(studyData[category])) {
            const found = studyData[category].find(item =>
                item.title.toLowerCase() === targetName.toLowerCase() ||
                (item.details && item.details.classe && item.details.classe.toLowerCase() === targetName.toLowerCase())
            );

            if (found) {
                openModal(found);
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
