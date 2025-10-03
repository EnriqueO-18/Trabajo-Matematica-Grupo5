class GraphVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = null;
        this.nodePositions = [];
        this.highlightedPath = null;
    }
    
    setGraph(graph) {
        this.graph = graph;
        this.calculateNodePositions();
    }
    
    calculateNodePositions() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 80;
        
        this.nodePositions = [];
        const angleStep = (2 * Math.PI) / this.graph.numNodes;
        
        for (let i = 0; i < this.graph.numNodes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            this.nodePositions.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
    }
    
    draw() {
        this.clear();
        this.drawEdges();
        this.drawNodes();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawEdges() {
        this.ctx.strokeStyle = '#cbd5e1';
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#64748b';
        
        for (const edge of this.graph.edges) {
            const from = this.nodePositions[edge.from];
            const to = this.nodePositions[edge.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
            
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(midX - 15, midY - 8, 30, 16);
            this.ctx.fillStyle = '#64748b';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(edge.weight, midX, midY + 4);
        }
    }
    
    drawHighlightedPath(path) {
        this.highlightedPath = path;
        this.draw();
        
        if (!path) return;
        
        this.ctx.strokeStyle = '#16a34a';
        this.ctx.lineWidth = 4;
        
        for (let i = 0; i < path.length - 1; i++) {
            const from = this.nodePositions[path[i]];
            const to = this.nodePositions[path[i + 1]];
            
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
            
            this.drawArrow(from, to);
        }
        
        const last = this.nodePositions[path[path.length - 1]];
        const first = this.nodePositions[path[0]];
        
        this.ctx.beginPath();
        this.ctx.moveTo(last.x, last.y);
        this.ctx.lineTo(first.x, first.y);
        this.ctx.stroke();
        this.drawArrow(last, first);
        
        this.drawNodes();
    }
    
    drawArrow(from, to) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        const endX = to.x - 25 * Math.cos(angle);
        const endY = to.y - 25 * Math.sin(angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle - arrowAngle),
            endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle + arrowAngle),
            endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
    }
    
    drawNodes() {
        for (let i = 0; i < this.graph.numNodes; i++) {
            const pos = this.nodePositions[i];
            const isInPath = this.highlightedPath && this.highlightedPath.includes(i);
            
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
            this.ctx.fillStyle = isInPath ? '#16a34a' : '#2563eb';
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(i, pos.x, pos.y);
        }
    }
}