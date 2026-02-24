export const categories = ['pathologies', 'medicaments', 'examens-paracliniques', 'examens-cliniques', 'soins-de-plaies', 'interventions', 'perinatalite-pediatrie'];

export const keyOrder = [
    'definition', 'indications', 'mode_action', 'pharmacocinetique', 'pharmacodynamie',
    'contre_indications', 'effets_secondaires', 'interactions', 'posologie', 'presentation',
    'soins_infirmiers',
    'types', 'types_avc', 'types_ic', 'manifestations_cliniques', 'examens_diagnostiques',
    'traitements', 'surveillance', 'complications'
];

export const linkMapping = [
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
