export function formatKey(key) {
    const customLabels = {
        'indications_posologie': 'Indications & Posologie',
        'effets_secondaires': 'Effets Secondaires',
        'contre_indications': 'Contre-indications',
        'surveillance_infirmiere': 'Surveillance Infirmière',
        'mecanisme_action': 'Mécanisme d\'action',
        'manifestations_cliniques': 'Manifestations Cliniques',
        'examens_diagnostiques': 'Examens Diagnostiques',
        'types_ic': 'Types d\'Insuffisance Cardiaque',
        'types_avc': 'Types d\'AVC',
        'pharmacocinetique': 'Pharmacocinétique',
        'pharmacodynamie': 'Pharmacodynamie'
    };

    if (customLabels[key]) return customLabels[key];

    return key.split('_')
        .map(word => {
            if (word === 'ic' || word === 'avc') return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export function formatCategoryName(slug) {
    const names = {
        'pathologies': 'Systèmes Physiologiques',
        'medicaments': 'Pharmacologie',
        'examens-paracliniques': 'Examens Paracliniques',
        'examens-cliniques': 'Évaluation Clinique',
        'soins-de-plaies': 'Soins de Plaies',
        'interventions': 'Interventions Infirmières',
        'perinatalite-pediatrie': 'Périnatalité & Pédiatrie'
    };
    return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}
