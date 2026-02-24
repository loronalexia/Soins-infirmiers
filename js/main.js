import { preloadAllData } from './data-service.js';
import { setupEventListeners, loadCategory, navigateToCategory, navigateToSystem, navigateToMedicationClass } from './navigation.js';
import { openModal, closeModal } from './modal-controller.js';

async function init() {
    console.log('Initialisation du Guide de poche...');

    // Expose essential functions to window for inline HTML handlers and card clicks
    window.loadCategory = loadCategory;
    window.navigateToCategory = navigateToCategory;
    window.navigateToSystem = navigateToSystem;
    window.navigateToMedicationClass = navigateToMedicationClass;
    window.openModal = openModal;
    window.closeModal = closeModal;

    try {
        // 1. Setup global listeners (Search, Nav, Modal)
        setupEventListeners();

        // 2. Preload all necessary JSON data
        await preloadAllData();

        // 3. Load initial view (Home)
        loadCategory('home');

    } catch (error) {
        console.error('Échec de l\'initialisation:', error);
    }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
