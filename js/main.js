import { preloadAllData } from './data-service.js';
import { setupEventListeners, loadCategory } from './navigation.js';

async function init() {
    console.log('Initialisation du Guide de poche...');

    try {
        // 1. Setup global listeners (Search, Nav, Modal)
        setupEventListeners();

        // 2. Preload all necessary JSON data
        await preloadAllData();

        // 3. Load initial view (Home)
        loadCategory('home');

    } catch (error) {
        console.error('Échec de l\'initialisation:', error);
        // data-service already shows the UI error message
    }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
