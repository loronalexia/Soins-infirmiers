import { categories } from './config.js';

// Global state cache
export let studyData = {};

export async function preloadAllData() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="loading">Chargement de la base de données...</div>';

    try {
        // All files to load (including invisible ones like sources and home)
        const filesToLoad = [...categories, 'sources', 'home'];

        const promises = filesToLoad.map(cat => fetch(`data/${cat}.json`).then(res => {
            if (!res.ok) throw new Error(`Erreur chargement ${cat}`);
            return res.json().then(data => ({ category: cat, data }));
        }));

        const results = await Promise.all(promises);
        results.forEach(res => {
            studyData[res.category] = res.data;
        });

        console.log('Données chargées:', Object.keys(studyData));
    } catch (error) {
        console.error('Erreur prechargement:', error);
        contentArea.innerHTML = `
            <div class="error-state">
                <p>Oups ! Impossible de charger les données.</p>
                <p class="error-tech">Détails : ${error.message}</p>
                <p style="margin-top:1rem; font-size:0.9rem;">Assurez-vous d'utiliser un serveur local (Live Server) pour ouvrir l'application.</p>
            </div>`;
        throw error; // Re-throw to stop initialization if critical
    }
}
