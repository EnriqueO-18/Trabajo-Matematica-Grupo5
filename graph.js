class Graph {
    constructor(numNodes) {
        this.numNodes = numNodes;
        this.adjacencyMatrix = [];
        this.nodes = [];
        this.edges = [];
        
        for (let i = 0; i < numNodes; i++) {
            this.nodes.push(i);
        }
        
        for (let i = 0; i < numNodes; i++) {
            this.adjacencyMatrix[i] = [];
            for (let j = 0; j < numNodes; j++) {
                this.adjacencyMatrix[i][j] = (i === j) ? 0 : Infinity;
            }
        }
    }
    
    generateRandom(minWeight = 10, maxWeight = 100) {
       
        for (let i = 0; i < this.numNodes; i++) {
            const next = (i + 1) % this.numNodes;
            const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
            this.adjacencyMatrix[i][next] = weight;
            this.adjacencyMatrix[next][i] = weight;
            this.edges.push({ from: i, to: next, weight: weight });
        }
        
        const maxAdditionalConnections = 3;
        
        for (let i = 0; i < this.numNodes; i++) {
            let connectionsAdded = 0;
            const possibleConnections = [];
            
            for (let j = i + 2; j < this.numNodes; j++) {
                
                if (i === 0 && j === this.numNodes - 1) continue;
                
                if (this.adjacencyMatrix[i][j] === Infinity) {
                    possibleConnections.push(j);
                }
            }
            
            possibleConnections.sort(() => Math.random() - 0.5);
            
            for (let j of possibleConnections) {
                if (connectionsAdded >= maxAdditionalConnections) break;
                
                if (Math.random() > 0.6) {
                    const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
                    this.adjacencyMatrix[i][j] = weight;
                    this.adjacencyMatrix[j][i] = weight;
                    this.edges.push({ from: i, to: j, weight: weight });
                    connectionsAdded++;
                }
            }
        }
    }
    
    setMatrix(matrix) {
        this.adjacencyMatrix = matrix;
        this.edges = [];
        
        for (let i = 0; i < this.numNodes; i++) {
            for (let j = i + 1; j < this.numNodes; j++) {
                if (matrix[i][j] !== Infinity && matrix[i][j] > 0) {
                    this.edges.push({ from: i, to: j, weight: matrix[i][j] });
                }
            }
        }
    }
    
    getEdgeWeight(from, to) {
        return this.adjacencyMatrix[from][to];
    }
    
    calculateCycleDistance(cycle) {
        let distance = 0;
        for (let i = 0; i < cycle.length - 1; i++) {
            const weight = this.getEdgeWeight(cycle[i], cycle[i + 1]);
            if (weight === Infinity) {
                return Infinity;
            }
            distance += weight;
        }

        const returnWeight = this.getEdgeWeight(cycle[cycle.length - 1], cycle[0]);
        if (returnWeight === Infinity) {
            return Infinity;
        }
        distance += returnWeight;
        return distance;
    }
}

class HamiltonianCycleFinder {
    constructor(graph) {
        this.graph = graph;
        this.cycles = [];
    }

    findAllCycles() {
        this.cycles = [];
        const visited = new Array(this.graph.numNodes).fill(false);
        const path = [0];
        visited[0] = true;
        
        this.findCyclesUtil(path, visited);
        
        this.cycles = this.removeDuplicateCycles(this.cycles);
        
        return this.cycles;
    }
    
    findCyclesUtil(path, visited) {
     
        if (path.length === this.graph.numNodes) {
            const lastNode = path[path.length - 1];
            const firstNode = path[0];
            
            if (this.graph.getEdgeWeight(lastNode, firstNode) !== Infinity) {
                this.cycles.push([...path]);
            }
            return;
        }
        
        for (let node = 0; node < this.graph.numNodes; node++) {
            if (!visited[node]) {
                const lastNode = path[path.length - 1];
                
                if (this.graph.getEdgeWeight(lastNode, node) !== Infinity) {
                    path.push(node);
                    visited[node] = true;
                    
                    this.findCyclesUtil(path, visited);
                    
                    path.pop();
                    visited[node] = false;
                }
            }
        }
    }
    
    removeDuplicateCycles(cycles) {
        const unique = [];
        const seen = new Set();
        
        for (const cycle of cycles) {
            const normalized = this.normalizeCycle(cycle);
            const key = normalized.join(',');
            
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(cycle);
            }
        }
        
        return unique;
    }
    
    normalizeCycle(cycle) {
        const minIndex = cycle.indexOf(Math.min(...cycle));
        const rotated = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
        
        const reversed = [rotated[0], ...rotated.slice(1).reverse()];
        
        for (let i = 1; i < rotated.length; i++) {
            if (rotated[i] < reversed[i]) return rotated;
            if (rotated[i] > reversed[i]) return reversed;
        }
        
        return rotated;
    }
}

class TSPSolver {
    constructor(graph) {
        this.graph = graph;
        this.bestCycle = null;
        this.bestDistance = Infinity;
        this.allCycles = [];
    }

    solve() {
        const finder = new HamiltonianCycleFinder(this.graph);
        this.allCycles = finder.findAllCycles();
        
        if (this.allCycles.length === 0) {
            return null;
        }
        
        for (const cycle of this.allCycles) {
            const distance = this.graph.calculateCycleDistance(cycle);
            
            if (distance < this.bestDistance) {
                this.bestDistance = distance;
                this.bestCycle = cycle;
            }
        }
        
        return {
            cycle: this.bestCycle,
            distance: this.bestDistance,
            totalCycles: this.allCycles.length
        };
    }
    
    getAllSolutions() {
        return this.allCycles.map(cycle => ({
            cycle: cycle,
            distance: this.graph.calculateCycleDistance(cycle)
        })).sort((a, b) => a.distance - b.distance);
    }
}