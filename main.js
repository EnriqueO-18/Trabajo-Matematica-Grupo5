let graph = null;
let visualizer = null;
let hamiltonianCycles = [];
let tspSolution = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    visualizer = new GraphVisualizer('graphCanvas');
    setupEventListeners();
    switchTab('graph');
}

function setupEventListeners() {
   
    document.querySelectorAll('input[name="genMethod"]').forEach(radio => {
        radio.addEventListener('change', handleMethodChange);
    });
    
    document.getElementById('generateGraph').addEventListener('click', generateGraph);
    document.getElementById('findHamiltonianCycles').addEventListener('click', findHamiltonianCycles);
    document.getElementById('solveTSP').addEventListener('click', solveTSP);
    document.getElementById('reset').addEventListener('click', resetApp);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    document.getElementById('numNodes').addEventListener('input', validateNodeInput);
}

function validateNodeInput(e) {
    const value = parseInt(e.target.value);
    if (value < 8) e.target.value = 8;
    if (value > 16) e.target.value = 16;
}

function handleMethodChange(e) {
    const manualInput = document.getElementById('manualInput');
    if (e.target.value === 'manual') {
        manualInput.style.display = 'block';
    } else {
        manualInput.style.display = 'none';
    }
}

function generateGraph() {
    const numNodes = parseInt(document.getElementById('numNodes').value);
    const method = document.querySelector('input[name="genMethod"]:checked').value;
    

    if (numNodes < 8 || numNodes > 16) {
        alert('El número de nodos debe estar entre 8 y 16');
        return;
    }
    
    graph = new Graph(numNodes);
    
    if (method === 'random') {
        graph.generateRandom(10, 100);
        visualizer.setGraph(graph);
        visualizer.draw();
        displayMatrix();
        showGraphInfo();
    } else {
        createManualMatrixInput(numNodes);
    }
    
    document.getElementById('findHamiltonianCycles').style.display = 'block';
    document.getElementById('solveTSP').style.display = 'block';
    document.getElementById('reset').style.display = 'block';
    hamiltonianCycles = [];
    tspSolution = null;
    document.getElementById('processSteps').innerHTML = '';
    document.getElementById('resultDisplay').innerHTML = '';
}

function createManualMatrixInput(n) {
    const container = document.getElementById('matrixContainer');
    let html = '<table class="matrix-table"><tr><th></th>';
    
    for (let i = 0; i < n; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr>';
    
    for (let i = 0; i < n; i++) {
        html += `<tr><th>${i}</th>`;
        for (let j = 0; j < n; j++) {
            if (i === j) {
                html += `<td class="diagonal">0</td>`;
            } else if (j > i) {
                html += `<td><input type="number" min="1" max="999" value="50" 
                         id="cell-${i}-${j}" class="matrix-input"></td>`;
            } else {
                html += `<td id="mirror-${j}-${i}">50</td>`;
            }
        }
        html += '</tr>';
    }
    html += '</table>';
    html += '<button class="btn btn-primary" onclick="applyManualMatrix()" style="margin-top: 15px;">Aplicar Matriz</button>';
    
    container.innerHTML = html;
    
    document.querySelectorAll('.matrix-input').forEach(input => {
        input.addEventListener('input', function() {
            const [i, j] = this.id.replace('cell-', '').split('-').map(Number);
            const mirror = document.getElementById(`mirror-${i}-${j}`);
            if (mirror) mirror.textContent = this.value;
        });
    });
}

function applyManualMatrix() {
    const n = graph.numNodes;
    const matrix = [];
    
    for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                matrix[i][j] = 0;
            } else {
                matrix[i][j] = Infinity;
            }
        }
    }
    
    document.querySelectorAll('.matrix-input').forEach(input => {
        const [i, j] = input.id.replace('cell-', '').split('-').map(Number);
        const value = parseInt(input.value) || 50;
        matrix[i][j] = value;
        matrix[j][i] = value; 
    });
    
    graph.setMatrix(matrix);
    visualizer.setGraph(graph);
    visualizer.draw();
    displayMatrix();
    showGraphInfo();
}

function showGraphInfo() {
    document.getElementById('graphInfo').style.display = 'block';
    document.getElementById('infoNodes').textContent = graph.numNodes;
    document.getElementById('infoEdges').textContent = graph.edges.length;
}

function displayMatrix() {
    const container = document.getElementById('matrixDisplay');
    const n = graph.numNodes;
    
    let html = '<table class="display-matrix"><tr><th></th>';
    
    for (let i = 0; i < n; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr>';
    
    for (let i = 0; i < n; i++) {
        html += `<tr><th>${i}</th>`;
        for (let j = 0; j < n; j++) {
            const value = graph.adjacencyMatrix[i][j];
            const displayValue = value === Infinity ? '∞' : value;
            const cellClass = i === j ? 'diagonal' : '';
            html += `<td class="${cellClass}">${displayValue}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    
    container.innerHTML = html;
}

function findHamiltonianCycles() {
    if (!graph) {
        alert('Primero debe generar un grafo');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
            const finder = new HamiltonianCycleFinder(graph);
            hamiltonianCycles = finder.findAllCycles();
            
            console.log(`Ciclos encontrados: ${hamiltonianCycles.length}`);
            
            displayHamiltonianCycles();
            showLoading(false);
            switchTab('process');
        } catch (error) {
            console.error('Error al buscar ciclos hamiltonianos:', error);
            alert('Ocurrió un error al buscar los ciclos hamiltonianos. Por favor, revise la consola para más detalles.');
            showLoading(false);
        }
    }, 100);
}

function displayHamiltonianCycles() {
    const container = document.getElementById('processSteps');
    
    let html = '<div class="step">';
    html += '<h3>Paso 1: Búsqueda de Ciclos Hamiltonianos</h3>';
    html += `<p><strong>Total de ciclos hamiltonianos encontrados:</strong> ${hamiltonianCycles.length}</p>`;
    html += '<p>Un ciclo hamiltoniano es un camino que visita cada nodo exactamente una vez y regresa al punto de partida.</p>';
    html += '<p><strong>Método usado:</strong> Búsqueda exhaustiva de todos los ciclos posibles</p>';
    html += '<p><strong>Proceso del algoritmo:</strong></p>';
    html += '<ul style="margin-left: 20px; line-height: 1.8;">';
    html += '<li>Se inicia desde el nodo 0</li>';
    html += '<li>Para cada posición, se prueban todos los nodos no visitados que tengan conexión con el último nodo del camino</li>';
    html += '<li>Si se visitan todos los nodos y existe arista de retorno al inicio, se registra el ciclo</li>';
    html += '<li>Si no se puede continuar, se regresa y se prueba con otro nodo</li>';
    html += '<li>Se eliminan ciclos duplicados (rotaciones y reversos del mismo ciclo)</li>';
    html += '</ul>';
    html += '</div>';
    
    html += '<div class="step">';
    html += '<h3>Paso 2: Lista Detallada de Ciclos Hamiltonianos Encontrados</h3>';
    
    if (hamiltonianCycles.length === 0) {
        html += '<p style="color: var(--danger-color);">No se encontraron ciclos hamiltonianos en este grafo.</p>';
    } else {
  
        const displayLimit = Math.min(50, hamiltonianCycles.length);
        
        for (let i = 0; i < displayLimit; i++) {
            const cycle = hamiltonianCycles[i];
            const distance = graph.calculateCycleDistance(cycle);
            html += `<div class="cycle-item">
                <strong>Ciclo ${i + 1}:</strong> ${cycle.join(' → ')} → ${cycle[0]} 
                | <strong>Distancia total:</strong> ${distance}
            </div>`;
        }
        
        if (hamiltonianCycles.length > 50) {
            html += `<p style="margin-top: 15px; color: #64748b;">
                <em>Mostrando ${displayLimit} de ${hamiltonianCycles.length} ciclos encontrados. 
                Todos los ciclos fueron evaluados para encontrar el óptimo.</em>
            </p>`;
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function solveTSP() {
    if (!graph) {
        alert('Primero debe generar un grafo');
        return;
    }
    
    if (hamiltonianCycles.length === 0) {
        alert('Primero debe encontrar los ciclos hamiltonianos');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
         
            const cyclesWithDistances = hamiltonianCycles.map(cycle => ({
                cycle: cycle,
                distance: graph.calculateCycleDistance(cycle)
            }));
            
            cyclesWithDistances.sort((a, b) => a.distance - b.distance);
            
            tspSolution = {
                cycle: cyclesWithDistances[0].cycle,
                distance: cyclesWithDistances[0].distance,
                totalCycles: hamiltonianCycles.length,
                allSolutions: cyclesWithDistances
            };
            
            displayTSPProcess(cyclesWithDistances);
            displayTSPResult(cyclesWithDistances);
            visualizer.drawHighlightedPath(tspSolution.cycle);
            switchTab('result');
            
            showLoading(false);
        } catch (error) {
            console.error('Error al resolver TSP:', error);
            alert('Ocurrió un error al resolver el TSP. Por favor, revise la consola para más detalles.');
            showLoading(false);
        }
    }, 100);
}

function displayTSPProcess(allSolutions) {
    const container = document.getElementById('processSteps');
    
    let html = container.innerHTML;
    
    html += '<div class="step">';
    html += '<h3>Paso 3: Traslado a Representación Matricial</h3>';
    html += '<p>Cada ciclo hamiltoniano identificado se representa utilizando la matriz de adyacencia del grafo.</p>';
    html += '<p>Para cada ciclo, se suman los pesos de las aristas que conectan los nodos consecutivos, incluyendo la arista de retorno al nodo inicial.</p>';
    html += '</div>';
    
    html += '<div class="step">';
    html += '<h3>Paso 4: Aplicación del Algoritmo de Fuerza Bruta</h3>';
    html += '<p>Se evalúa exhaustivamente la distancia total de cada uno de los ciclos hamiltonianos para identificar el óptimo.</p>';
    html += `<p><strong>Total de ciclos evaluados:</strong> ${allSolutions.length}</p>`;
    html += '<p><strong>Proceso de evaluación:</strong></p>';
    html += '<ul style="margin-left: 20px; line-height: 1.8;">';
    html += '<li>Para cada ciclo, se calcula la suma de pesos de todas las aristas</li>';
    html += '<li>Se incluye el peso de la arista de retorno al nodo inicial</li>';
    html += '<li>Se comparan todas las distancias calculadas</li>';
    html += '<li>Se selecciona el ciclo con la distancia mínima como solución óptima</li>';
    html += '</ul>';
    html += '</div>';
    
    html += '<div class="step">';
    html += '<h3>Paso 5: Resultados de la Evaluación</h3>';
    
    const top10 = allSolutions.slice(0, Math.min(10, allSolutions.length));
    const worst5 = allSolutions.length > 15 ? allSolutions.slice(-5) : [];
    
    html += '<h4 style="color: var(--success-color); margin: 15px 0;">⭐ Top 10 Mejores Ciclos:</h4>';
    top10.forEach((sol, idx) => {
        const isOptimal = idx === 0;
        html += `<div class="cycle-item ${isOptimal ? 'optimal' : ''}">
            <strong>${isOptimal ? '🏆 ' : ''}Posición ${idx + 1}:</strong> 
            ${sol.cycle.join(' → ')} → ${sol.cycle[0]} 
            | <strong>Distancia:</strong> ${sol.distance}
            ${isOptimal ? ' <strong>(CICLO ÓPTIMO - SOLUCIÓN TSP)</strong>' : ''}
        </div>`;
    });
    
    if (worst5.length > 0) {
        html += '<p style="margin: 15px 0; color: #64748b;">...</p>';
        html += '<h4 style="color: var(--danger-color); margin: 15px 0;">5 Peores Ciclos (Mayor Distancia):</h4>';
        worst5.forEach((sol, idx) => {
            const actualIdx = allSolutions.length - 5 + idx;
            html += `<div class="cycle-item">
                <strong>Posición ${actualIdx + 1}:</strong> 
                ${sol.cycle.join(' → ')} → ${sol.cycle[0]} 
                | <strong>Distancia:</strong> ${sol.distance}
            </div>`;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function displayTSPResult(allSolutions) {
    const container = document.getElementById('resultDisplay');
    
    let html = '<div class="result-card">';
    html += '<h2> Solución Óptima Encontrada</h2>';
    html += `<div class="result-value">${tspSolution.distance}</div>`;
    html += '<p style="font-size: 1.1rem;">Distancia Total Mínima</p>';
    html += `<div class="result-path">
        Ruta Óptima: ${tspSolution.cycle.join(' → ')} → ${tspSolution.cycle[0]}
    </div>`;
    html += '</div>';
    
    const worstDistance = allSolutions[allSolutions.length - 1].distance;
    const avgDistance = allSolutions.reduce((sum, sol) => sum + sol.distance, 0) / allSolutions.length;
    const improvement = ((worstDistance - tspSolution.distance) / worstDistance * 100).toFixed(2);
    
    html += '<div class="result-stats">';
    html += `<div class="stat-card">
        <h4>Ciclos Evaluados</h4>
        <p>${tspSolution.totalCycles}</p>
    </div>`;
    html += `<div class="stat-card">
        <h4>Distancia Promedio</h4>
        <p>${avgDistance.toFixed(2)}</p>
    </div>`;
    html += `<div class="stat-card">
        <h4>Peor Distancia</h4>
        <p>${worstDistance}</p>
    </div>`;
    html += `<div class="stat-card">
        <h4>Mejora vs Peor</h4>
        <p>${improvement}%</p>
    </div>`;
    html += '</div>';

    html += '<div style="margin-top: 30px; padding: 20px; background-color: var(--bg-color); border-radius: 8px;">';
    html += '<h3 style="color: var(--primary-color); margin-bottom: 15px;">Análisis del Resultado</h3>';
    html += `<p><strong>Algoritmo utilizado:</strong> Fuerza Bruta (Evaluación exhaustiva)</p>`;
    html += `<p><strong>Complejidad computacional:</strong> O(n!) donde n = ${graph.numNodes} nodos</p>`;
    html += `<p><strong>Total de permutaciones evaluadas:</strong> ${tspSolution.totalCycles} ciclos hamiltonianos</p>`;
    html += `<p><strong>Garantía de optimalidad:</strong> Sí. El algoritmo de fuerza bruta garantiza encontrar la solución óptima global al evaluar todos los ciclos posibles.</p>`;
    html += `<p><strong>Verificación:</strong> El ciclo seleccionado tiene la distancia mínima entre todos los ${tspSolution.totalCycles} ciclos hamiltonianos identificados.</p>`;
    html += '</div>';
    
    container.innerHTML = html;
}

function switchTab(tabName) {

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function resetApp() {
    if (!confirm('¿Está seguro de que desea reiniciar? Se perderán todos los datos actuales.')) {
        return;
    }
    
    graph = null;
    hamiltonianCycles = [];
    tspSolution = null;
    
    if (visualizer) {
        visualizer.clear();
    }
    
    document.getElementById('matrixDisplay').innerHTML = '';
    document.getElementById('processSteps').innerHTML = '';
    document.getElementById('resultDisplay').innerHTML = '';
    document.getElementById('matrixContainer').innerHTML = '';
    
    document.getElementById('manualInput').style.display = 'none';
    document.getElementById('graphInfo').style.display = 'none';
    document.getElementById('findHamiltonianCycles').style.display = 'none';
    document.getElementById('solveTSP').style.display = 'none';
    document.getElementById('reset').style.display = 'none';
    
    document.getElementById('numNodes').value = 8;
    document.querySelector('input[name="genMethod"][value="random"]').checked = true;
    
    switchTab('graph');
}