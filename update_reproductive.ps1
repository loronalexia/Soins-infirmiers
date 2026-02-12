$PathologiesPath = "c:\Users\alexi\Desktop\Stie\pathologies.json"
$InterventionsPath = "c:\Users\alexi\Desktop\Stie\interventions.json"

# New Pathologies
$NewPathologies = @(
    @{
        id = "p76"
        title = "ITSS (Infections Transmissibles Sexuellement et par le Sang)"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Infections transmises principalement par contact sexuel ou sanguin."
        details = @{
            généralités = "Inclut la Chlamydia, Gonorrhée, Syphilis, VPH, Herpès génital, VIH et Hépatites B/C."
            symptomes = @("Écoulements anormaux (pertes vaginales, urétrales)", "Lésions cutanées (ulcères, verrues, vésicules)", "Douleurs pelviennes", "Asymptomatique (très fréquent)")
            dépistage = @("Prélèvements locaux (écouvillon)", "Analyses d'urine", "Prélèvements sanguins (sérologies)")
            prévention = @("Port du préservatif", "Vaccination (VPH, Hépatite B)", "Dépistage régulier et traitement des partenaires")
        }
    },
    @{
        id = "p77"
        title = "Troubles Bénins (Féminin)"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Affections non cancéreuses du système reproducteur féminin."
        details = @{
            endométriose = "Présence de tissu utérin hors de l'utérus entraînant douleurs et infertilité."
            fibromes = "Tumeurs musculaires bénignes de l'utérus."
            kystes = "Sacs remplis de liquide sur ou dans les ovaires."
            symptomes = @("Douleurs pelviennes chroniques", "Dysménorrhée intense (règles douloureuses)", "Saignements irréguliers", "Dyspareunie (douleur lors des rapports)")
            traitements = @("Contraceptifs hormonaux", "Analgésiques (AINS)", "Chirurgie conservatrice ou radicale")
        }
    },
    @{
        id = "p78"
        title = "Cancer du Col de l'Utérus"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Cancer lié principalement à une infection persistante au VPH."
        details = @{
            causes = "Virus du Papillome Humain (VPH) à haut risque."
            dépistage = "Test Pap (cytologie vaginale) ou test VPH."
            symptomes = @("Souvent aucun au début", "Saignements après les rapports", "Pertes vaginales inhabituelles")
            prévention = @("Vaccination VPH", "Suivi régulier (dépistage)")
        }
    },
    @{
        id = "p79"
        title = "Cancer de l'Utérus (Endomètre)"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Cancer de la muqueuse tapissant l'intérieur de l'utérus."
        details = @{
            facteurs_risque = "Obésité, exposition prolongée aux oestrogènes."
            symptomes = "Saignements post-ménopausiques (Signe d'alerte majeur)."
            diagnostic = "Biopsie de l'endomètre, échographie pelvienne."
            traitements = @("Hystérectomie", "Radiothérapie", "Hormonothérapie")
        }
    },
    @{
        id = "p80"
        title = "Cancer de l'Ovaire"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Un des cancers gynécologiques les plus graves car souvent diagnostiqué tardivement."
        details = @{
            symptomes = @("Vagues ballonnements abdominaux", "Sensation de satiété précoce", "Augmentation du volume abdominal", "Urgence mictionnelle")
            facteurs_risque = "Génétique (BRCA1/BRCA2), nulliparité."
            traitements = @("Chirurgie de cytoréduction", "Chimiothérapie intensive")
        }
    },
    @{
        id = "p81"
        title = "Cancer du Sein"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Cancer le plus fréquent chez la femme."
        details = @{
            dépistage = "Mammographie de dépistage, auto-examen des seins."
            symptomes = @("Masse dure et indolore", "Modification de la forme du sein", "Écoulement mamelonnaire", "Peau d'orange")
            traitements = @("Tumorectomie ou Mastectomie", "Radiothérapie / Chimiothérapie", "Hormonothérapie (si récepteurs positifs)")
        }
    },
    @{
        id = "p82"
        title = "Hyperplasie Bénigne de la Prostate (HBP)"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Augmentation non cancéreuse du volume de la prostate liée à l'âge."
        details = @{
            symptomes = @("Jet urinaire faible ou saccadé", "Difficulté à débuter la miction", "Nicturie (lever la nuit)", "Impériosité mictionnelle")
            complications = "Rétention urinaire aiguë, calculs urinaires."
            traitements = @("Alpha-bloquants", "Inhibiteurs de la 5-alpha-réductase", "Résection transurétrale (TURP)")
        }
    },
    @{
        id = "p83"
        title = "Cancer de la Prostate"
        category = "pathologies"
        systeme = "Reproducteur"
        preview = "Cancer fréquent chez l'homme, souvent à évolution lente."
        details = @{
            dépistage = "Toucher rectal (TR) et dosage de l'APS (Antigène Prostatique Spécifique)."
            symptomes = @("Peuvent être identiques à l'HBP", "Douleurs osseuses (si métastases)")
            traitements = @("Surveillance active", "Prostatectomie radicale", "Curiethérapie / Radiothérapie", "Hormonothérapie (privation ischémique)")
        }
    }
)

# New Interventions
$NewInterventions = @(
    @{
        id = "int21"
        title = "Hystérectomie"
        category = "interventions"
        preview = "Ablation chirurgicale de l'utérus."
        details = @{
            types = @("Totale: Utérus et col", "Subtotale: Corps de l'utérus uniquement", "Avec salpingo-ovariectomie: Trompes et ovaires (ménaopause induite)")
            soins_post_op = @("Surveillance des saignements (serviettes périnéales)", "Reprise précoce de la marche (prévention TVP)", "Soutien émotionnel (perte de fertilité/féminité)")
        }
    },
    @{
        id = "int22"
        title = "Mastectomie Radiale Modifiée"
        category = "interventions"
        preview = "Ablation du sein et des ganglions axillaires."
        details = @{
            soins_post_op = @("Élévation du bras du côté opéré", "PAS de prises de TA ou ponctions sur le bras opéré (risque lymphoedème)", "Exercices graduels du bras", "Surveillance du drain")
        }
    },
    @{
        id = "int23"
        title = "Tumorectomie (Sein)"
        category = "interventions"
        preview = "Ablation de la tumeur mammaire with une marge de tissu sain conservant le sein."
        details = @{
            description = "Souvent complétée par une radiothérapie."
            soins = @("Surveillance de l'incision", "Soutien gorge de maintien post-opératoire")
        }
    },
    @{
        id = "int24"
        title = "Résection Transurétrale de la Prostate (TURP)"
        category = "interventions"
        preview = "Procédure chirurgicale visant à retirer une partie de la prostate par l'urètre."
        details = @{
            soins_post_op = @("Irrigation vésicale continue (3-voies) pour prévenir les caillots", "Calcul de la diurèse réelle (déduire le soluté d'irrigation)", "Surveillance de la couleur de l'urine (hématurie)")
            complication = "Syndrome de la TURP (absorption excessive du liquide d'irrigation)."
        }
    },
    @{
        id = "int25"
        title = "Prostatectomie Radicale"
        category = "interventions"
        preview = "Ablation complète de la prostate, des vésicules séminales et parfois des ganglions."
        details = @{
            post_op = @("Sonde urinaire prolongée (1-2 semaines)", "Risque d'incontinence et de dysfonction érectile", "Rééducation pelvienne")
        }
    }
)

function Update-Json($FilePath, $NewItems) {
    if (Test-Path $FilePath) {
        $Data = Get-Content $FilePath -Raw | ConvertFrom-Json
        $ExistingIds = $Data | Select-Object -ExpandProperty id
        foreach ($Item in $NewItems) {
            if ($ExistingIds -notcontains $Item.id) {
                $Data += $Item
            }
        }
        $Data | ConvertTo-Json -Depth 10 | Set-Content $FilePath
        Write-Host "Updated $FilePath"
    }
}

Update-Json $PathologiesPath $NewPathologies
Update-Json $InterventionsPath $NewInterventions
