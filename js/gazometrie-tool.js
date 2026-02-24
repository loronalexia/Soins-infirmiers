export function renderGazometrie() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="gazometrie-container">
            <div class="class-view-header">
                <h2>Outil d'Analyse : Gazométrie Artérielle</h2>
            </div>
            <div class="card gazometrie-form">
                <p class="instruct">Entrez les valeurs pour obtenir une interprétation automatique.</p>
                <div class="input-group">
                    <label>pH (7.35 - 7.45)</label>
                    <input type="number" id="ph" step="0.01" placeholder="ex: 7.32">
                </div>
                <div class="input-group">
                    <label>PaCO2 (35 - 45 mmHg)</label>
                    <input type="number" id="paco2" placeholder="ex: 52">
                </div>
                <div class="input-group">
                    <label>HCO3- (22 - 26 mEq/L)</label>
                    <input type="number" id="hco3" placeholder="ex: 24">
                </div>
                <button id="analyze-btn" class="nav-item active" style="margin-top:20px; width:100%;">Analyser</button>
            </div>
            <div id="gazometrie-result" class="hidden"></div>

            <div class="card" style="margin-top: 30px;">
                <h3 style="color:var(--primary-color); margin-bottom:15px;">Valeurs de Référence</h3>
                <ul class="ref-list">
                    <li><strong>pH :</strong> 7.35 - 7.45</li>
                    <li><strong>PaCO2 :</strong> 35 - 45 mmHg (Composante respiratoire)</li>
                    <li><strong>HCO3- :</strong> 22 - 26 mEq/L (Composante métabolique)</li>
                    <li><strong>PaO2 :</strong> 80 - 100 mmHg</li>
                    <li><strong>SaO2 :</strong> > 95%</li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('analyze-btn').onclick = interpretBloodGas;
}

export function interpretBloodGas() {
    const ph = parseFloat(document.getElementById('ph').value);
    const paco2 = parseFloat(document.getElementById('paco2').value);
    const hco3 = parseFloat(document.getElementById('hco3').value);
    const resultDiv = document.getElementById('gazometrie-result');

    if (isNaN(ph) || isNaN(paco2) || isNaN(hco3)) {
        alert("Veuillez entrer toutes les valeurs.");
        return;
    }

    let interpretation = "";
    let compensation = "Non compensée";
    let status = "normal";

    // Étape 1 : pH
    if (ph < 7.35) status = "acidose";
    else if (ph > 7.45) status = "alcalose";
    else status = "normal";

    // Étape 2 : Origine
    let respiration = (paco2 < 35 || paco2 > 45);
    let metabolique = (hco3 < 22 || hco3 > 26);

    if (status === "acidose") {
        if (paco2 > 45 && hco3 > 26) {
            interpretation = "Acidose Respiratoire";
            compensation = "Partiellement compensée";
        } else if (paco2 > 45) {
            interpretation = "Acidose Respiratoire";
        } else if (hco3 < 22 && paco2 < 35) {
            interpretation = "Acidose Métabolique";
            compensation = "Partiellement compensée";
        } else if (hco3 < 22) {
            interpretation = "Acidose Métabolique";
        }
    } else if (status === "alcalose") {
        if (paco2 < 35 && hco3 < 22) {
            interpretation = "Alcalose Respiratoire";
            compensation = "Partiellement compensée";
        } else if (paco2 < 35) {
            interpretation = "Alcalose Respiratoire";
        } else if (hco3 > 26 && paco2 > 45) {
            interpretation = "Alcalose Métabolique";
            compensation = "Partiellement compensée";
        } else if (hco3 > 26) {
            interpretation = "Alcalose Métabolique";
        }
    } else {
        // pH normal mais valeurs anormales = compensation totale
        if (respiration && metabolique) {
            if (ph < 7.40) {
                interpretation = (paco2 > 45) ? "Acidose Respiratoire" : "Acidose Métabolique";
            } else {
                interpretation = (paco2 < 35) ? "Alcalose Respiratoire" : "Alcalose Métabolique";
            }
            compensation = "Entièrement compensée";
        } else {
            interpretation = "Normal";
            compensation = "-";
        }
    }

    resultDiv.innerHTML = `
        <div class="card result-card ${status}">
            <h3>Interprétation</h3>
            <p class="main-result">${interpretation}</p>
            <p><strong>Compensation :</strong> ${compensation}</p>
            <div class="result-details">
                <span>pH: ${ph}</span>
                <span>PaCO2: ${paco2}</span>
                <span>HCO3: ${hco3}</span>
            </div>
        </div>
    `;
    resultDiv.classList.remove('hidden');
}
