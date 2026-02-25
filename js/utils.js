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
        'pharmacodynamie': 'Pharmacodynamie',
        'molecules_list': 'Molécules incluses',
        'precautions': 'Précautions et mises en garde',
        'reactions_indesirables': 'Réactions indésirables et effets secondaires',
        'posologie': 'Voies d\'administration et posologie',
        'evaluation': 'Évaluation de la situation',
        'tests_labo': 'Tests de laboratoire',
        'constats': 'Constats d\'évaluation',
        'interventions': 'Interventions infirmières',
        'enseignement': 'Enseignement au patient et à ses proches',
        'efficacite': 'Vérification de l\'effet thérapeutique',
        'but': 'But de l\'examen',
        'normes': 'Valeurs normales',
        'interpretations': 'Interprétations cliniques',
        'soins_pre_op': 'Soins préopératoires',
        'surveillance_post_op': 'Surveillance postopératoire',
        'soins_post_op': 'Soins postopératoires',
        'soins_infirmiers_post_op': 'Soins infirmiers post-op',
        'complications_specifiques': 'Complications spécifiques',
        'signes_alerte': 'Signes d\'alerte (Urgence)',
        'conseils_post_op': 'Conseils postopératoires',
        'soins_et_precautions': 'Soins et précautions',
        'education_patient': 'Éducation du patient',
        'post_op': 'Suivi post-op',
        'soins': 'Soins spécifiques',
        'en_post_op': 'En phase post-op',
        'parametres_de_base': 'Paramètres de base',
        'urgences': 'Urgences & Risques',
        'acces_vasculaires': 'Accès vasculaires',
        'soins_fistule': 'Soins de la fistule',
        'surveillance_traitement': 'Surveillance du traitement',
        'principes': 'Principes d\'administration',
        'soins_pre_transfusionnels': 'Vérifications pré-transfusionnelles',
        'surveillance_pendant': 'Surveillance pendant l\'acte',
        'complications_rections': 'Réactions & Complications',
        'surveillance_calcium': 'Surveillance du calcium',
        'soins_moignon': 'Soins du moignon',
        'douleur': 'Gestion de la douleur'
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
