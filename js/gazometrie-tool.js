export function renderGazometrie() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="gazometrie-container">

            <!-- Header -->
            <div class="class-view-header" style="margin-bottom: 2rem;">
                <h2>🫁 Gazométrie</h2>
            </div>

            <!-- Input Card -->
            <div class="gazometrie-card">
                <p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 500;">
                    Entrez les valeurs du bilan gazométrique pour obtenir une interprétation clinique automatique.
                </p>

                <div class="gazometrie-grid">
                    <div class="input-field">
                        <label>pH sanguin</label>
                        <input type="number" id="gz-ph" step="0.01" placeholder="7.40">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Ref: 7.35 – 7.45</span>
                    </div>
                    <div class="input-field">
                        <label>PaCO₂ (mmHg)</label>
                        <input type="number" id="gz-paco2" step="0.1" placeholder="40">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Ref: 35 – 45</span>
                    </div>
                    <div class="input-field">
                        <label>HCO₃⁻ (mEq/L)</label>
                        <input type="number" id="gz-hco3" step="0.1" placeholder="24">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Ref: 22 – 26</span>
                    </div>
                    <div class="input-field">
                        <label>Excès de Base (EB)</label>
                        <input type="number" id="gz-eb" step="0.1" placeholder="0">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Ref: -2 à +2 mEq/L</span>
                    </div>
                </div>

                <button class="analyze-button" id="analyze-btn">
                    ✦ Analyser les gaz sanguins
                </button>
            </div>

            <!-- Result Zone -->
            <div id="gazometrie-result"></div>

            <!-- Reference Values Card -->
            <div class="gazometrie-card">
                <h3 style="font-size: 1rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    📋 Valeurs de Référence
                </h3>
                <div class="ref-grid">
                    <div class="ref-item"><strong>pH</strong><span>7.35 – 7.45</span></div>
                    <div class="ref-item"><strong>PaCO₂</strong><span>35 – 45 mmHg</span></div>
                    <div class="ref-item"><strong>HCO₃⁻</strong><span>22 – 26 mEq/L</span></div>
                    <div class="ref-item"><strong>EB</strong><span>-2 à +2 mEq/L</span></div>
                    <div class="ref-item"><strong>PaO₂</strong><span>80 – 100 mmHg</span></div>
                    <div class="ref-item"><strong>SaO₂</strong><span>&gt; 95%</span></div>
                </div>

                <!-- Legend -->
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #F0F0F0;">
                    <p style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase;">Mémo Clinique</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem; color: var(--text-color);">
                        <p>📉 pH &lt; 7.35 → <strong>Acidose</strong></p>
                        <p>📈 pH &gt; 7.45 → <strong>Alcalose</strong></p>
                        <p>💨 PaCO₂ ↑ → Origine <strong>respiratoire</strong></p>
                        <p>🧪 HCO₃⁻ ↓ → Origine <strong>métabolique</strong></p>
                        <p>⚡ EB &lt; -2 → <strong>Acidose métabolique</strong></p>
                        <p>⚡ EB &gt; +2 → <strong>Alcalose métabolique</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('analyze-btn').onclick = interpretBloodGas;
}

export function interpretBloodGas() {
    const ph = parseFloat(document.getElementById('gz-ph').value);
    const paco2 = parseFloat(document.getElementById('gz-paco2').value);
    const hco3 = parseFloat(document.getElementById('gz-hco3').value);
    const eb = parseFloat(document.getElementById('gz-eb').value);
    const resultDiv = document.getElementById('gazometrie-result');

    const ebValid = !isNaN(eb);

    if (isNaN(ph) || isNaN(paco2) || isNaN(hco3)) {
        resultDiv.innerHTML = `
            <div class="gazometrie-card" style="border: 2px solid #FFE5EC; text-align:center; color: var(--primary-color); font-weight: 600;">
                ⚠️ Veuillez entrer pH, PaCO₂ et HCO₃⁻ pour obtenir une interprétation.
            </div>`;
        return;
    }

    let interpretation = '';
    let detail = '';
    let compensation = 'Non compensée';
    let status = 'normal';
    let icon = '✅';
    let manifestations = [];

    // Étape 1 : pH
    if (ph < 7.35) { status = 'acidose'; icon = '🔴'; }
    else if (ph > 7.45) { status = 'alcalose'; icon = '🔵'; }

    // Étape 2 : Origine et compensation
    const highCO2 = paco2 > 45;
    const lowCO2 = paco2 < 35;
    const lowHCO3 = hco3 < 22;
    const highHCO3 = hco3 > 26;
    const lowEB = ebValid && eb < -2;   // EB négatif → acidose métabolique
    const highEB = ebValid && eb > 2;    // EB positif → alcalose métabolique

    if (status === 'acidose') {
        if (highCO2 && lowEB) {
            interpretation = 'Acidose Mixte (Respiratoire + Métabolique)';
            detail = 'PaCO₂ élevée ET EB négatif : double mécanisme acidosique.';
            manifestations = [
                '😮‍💨 Détresse respiratoire sévère', '😵‍💫 Altération de la conscience',
                '🫀 Arythmies', '🌡️ Hypotension', '😰 Cyanose', '⚠️ Pronostic réservé'
            ];
        } else if (highCO2) {
            interpretation = 'Acidose Respiratoire';
            detail = 'La PaCO₂ élevée indique une hypoventilation alvéolaire (rétention de CO₂).';
            if (highHCO3 || (ebValid && eb > 0)) compensation = 'Partiellement compensée (compensation rénale)';
            manifestations = [
                '😮‍💨 Bradypnée, tirage respiratoire', '😴 Somnolence, confusion',
                '🫀 Tachycardie', '😰 Cyanose', '🌡️ Céphalées',
                '💪 Astérixis (flapping tremor)', '🩺 ↑ PaCO₂', '⚠️ Hypoxémie possible'
            ];
        } else if (lowHCO3 || lowEB) {
            interpretation = 'Acidose Métabolique';
            const ebNote = ebValid ? ` EB = ${eb} mEq/L confirme l'origine métabolique.` : '';
            detail = `Les bicarbonates bas indiquent une perte de base ou un gain d'acide.${ebNote}`;
            if (lowCO2) compensation = 'Partiellement compensée (compensation respiratoire)';
            manifestations = [
                '😮‍💨 Respiration de Kussmaul', '🤢 Nausées, vomissements',
                '😵 Confusion, léthargie', '⚡ Hyperkaliémie possible',
                '💧 Déshydratation', '🩺 ↓ HCO₃⁻ / EB négatif',
                '😩 Asthénie marquée', '🫀 Arythmie (si sévère)'
            ];
        } else {
            interpretation = 'Acidose (mécanisme à préciser)';
            detail = 'Évaluation clinique approfondie nécessaire.';
            manifestations = ['⚠️ Évaluation complémentaire requise'];
        }
    } else if (status === 'alcalose') {
        if (lowCO2 && highEB) {
            interpretation = 'Alcalose Mixte (Respiratoire + Métabolique)';
            detail = 'PaCO₂ basse ET EB positif : double mécanisme alcalosique.';
            manifestations = [
                '😤 Hyperventilation marquée', '⚡ Hypokaliémie sévère',
                '😬 Tétanie', '😵 Confusion', '🫀 Arythmies', '⚠️ Pronostic réservé'
            ];
        } else if (lowCO2) {
            interpretation = 'Alcalose Respiratoire';
            detail = 'La PaCO₂ basse indique une hyperventilation (élimination excessive de CO₂).';
            if (lowHCO3 || (ebValid && eb < 0)) compensation = 'Partiellement compensée (compensation rénale)';
            manifestations = [
                '😤 Hyperventilation, polypnée', '😵 Étourdissements, vertiges',
                '🖐️ Paresthésies (mains, pieds)', '😬 Crampes, tétanie',
                '😟 Anxiété, agitation', '🫀 Palpitations',
                '😮 Spasme carpopédal possible', '🩺 ↓ PaCO₂'
            ];
        } else if (highHCO3 || highEB) {
            interpretation = 'Alcalose Métabolique';
            const ebNote = ebValid ? ` EB = +${eb} mEq/L confirme l'origine métabolique.` : '';
            detail = `Les bicarbonates élevés indiquent un gain de base ou une perte d'acide.${ebNote}`;
            if (highCO2) compensation = 'Partiellement compensée (compensation respiratoire)';
            manifestations = [
                '🤢 Nausées, vomissements (cause fréquente)', '💧 Déshydratation, hypovolémie',
                '⚡ Hypokaliémie', '😵 Confusion, faiblesse musculaire',
                '🖐️ Crampes, paresthésies', '😴 Léthargie',
                '🫀 Arythmie cardiaque possible', '🩺 ↑ HCO₃⁻ / EB positif'
            ];
        } else {
            interpretation = 'Alcalose (mécanisme à préciser)';
            detail = 'Évaluation clinique approfondie nécessaire.';
            manifestations = ['⚠️ Évaluation complémentaire requise'];
        }
    } else {
        // pH normal
        if ((highCO2 || lowCO2) && (lowHCO3 || highHCO3 || lowEB || highEB)) {
            interpretation = 'Trouble entièrement compensé';
            detail = 'Le pH est normal mais les valeurs compensatoires sont anormales — trouble compensé.';
            compensation = 'Entièrement compensée';
            interpretation += ph < 7.40 ? ' (tendance acidosique)' : ' (tendance alcalosique)';
            manifestations = [
                '⚖️ pH compensé — trouble sous-jacent possible', '🔍 Surveillance étroite recommandée',
                '📋 Contexte clinique indispensable'
            ];
        } else {
            interpretation = 'Valeurs Normales';
            detail = 'L\'équilibre acido-basique est dans les limites normales.';
            compensation = '—';
            manifestations = ['✅ Aucun signe de déséquilibre acido-basique'];
        }
    }

    // Rendu des manifestations
    const manifestationsHtml = `
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.15); border-radius: 16px; position: relative; z-index: 2;">
            <p style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; margin-bottom: 1rem;">
                🩺 Manifestations Cliniques
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.6rem;">
                ${manifestations.map(m => `
                    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 0.5rem 0.75rem; font-size: 0.88rem; font-weight: 500;">
                        ${m}
                    </div>`).join('')}
            </div>
        </div>`;

    resultDiv.innerHTML = `
        <div class="result-box">
            <div class="interpretation-card ${status}">
                <span class="status-badge">${icon} ${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <p class="main-interpretation">${interpretation}</p>
                <p class="compensation-label">⚖️ Compensation : ${compensation}</p>
                <p style="margin-top: 0.75rem; font-size: 0.95rem; opacity: 0.9; position: relative; z-index: 2;">${detail}</p>
                ${manifestationsHtml}
                <div class="values-box">
                    <div class="value-pill"><span>pH</span><span>${ph}</span></div>
                    <div class="value-pill"><span>PaCO₂</span><span>${paco2}</span></div>
                    <div class="value-pill"><span>HCO₃⁻</span><span>${hco3}</span></div>
                    ${ebValid ? `<div class="value-pill"><span>EB</span><span>${eb > 0 ? '+' : ''}${eb}</span></div>` : ''}
                </div>
            </div>
        </div>
    `;
}
