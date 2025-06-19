        // Grid configuration
        const ROWS = 25;
        const COLS = 40;
        let grid = [];
        let startCell = {row: 5, col: 5};
        let endCell = {row: 19, col: 35};
        let selectedTool = 'wall';
        let selectedAlgo = 'astar';
        let isMouseDown = false;
        let visualizationSpeed = 50; // ms
        let directions = 4; // 4 or 8 directions
        let isVisualizing = false;
        
        // Initialize the grid
        function initializeGrid() {
            const gridContainer = document.getElementById('pathfinding-grid');
            gridContainer.innerHTML = '';
            grid = [];
            
            for (let row = 0; row < ROWS; row++) {
                grid[row] = [];
                for (let col = 0; col < COLS; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    
                    // Add event listeners
                    cell.addEventListener('mousedown', handleMouseDown);
                    cell.addEventListener('mouseenter', handleMouseEnter);
                    cell.addEventListener('mouseup', handleMouseUp);
                    
                    gridContainer.appendChild(cell);
                    grid[row][col] = {
                        row: row,
                        col: col,
                        isWall: false,
                        isWeight: false,
                        isStation: false,
                        element: cell
                    };
                }
            }
            
            // Set start and end cells
            updateCell(startCell.row, startCell.col, 'start');
            updateCell(endCell.row, endCell.col, 'end');
            
            // Add initial walls for demonstration
            addDemoWalls();
        }
        
        // Add some demo walls for visual interest
        function addDemoWalls() {
            // Horizontal walls
            for (let col = 5; col <= 20; col++) {
                updateCell(10, col, 'wall');
            }
            
            // Vertical walls
            for (let row = 5; row <= 15; row++) {
                updateCell(row, 15, 'wall');
            }
            
            // Diagonal walls
            for (let i = 0; i < 8; i++) {
                updateCell(15+i, 20+i, 'wall');
            }
            
            // Weight cells
            for (let i = 0; i < 5; i++) {
                updateCell(3, 10+i, 'weight');
                updateCell(20, 30-i, 'weight');
            }
            
            // Stations
            updateCell(7, 30, 'station');
            updateCell(18, 10, 'station');
        }
        
        // Update a cell with a specific type
        function updateCell(row, col, type) {
            const cell = grid[row][col].element;
            const cellData = grid[row][col];
            
            // Reset cell classes
            cell.className = 'cell';
            cellData.isWall = false;
            cellData.isWeight = false;
            cellData.isStation = false;
            
            switch(type) {
                case 'start':
                    cell.classList.add('start');
                    cell.innerHTML = '<i class="fas fa-play"></i>';
                    startCell = {row, col};
                    break;
                case 'end':
                    cell.classList.add('end');
                    cell.innerHTML = '<i class="fas fa-flag"></i>';
                    endCell = {row, col};
                    break;
                case 'wall':
                    cell.classList.add('wall');
                    cellData.isWall = true;
                    break;
                case 'weight':
                    cell.classList.add('weight');
                    cell.innerHTML = '<i class="fas fa-weight-hanging"></i>';
                    cellData.isWeight = true;
                    break;
                case 'station':
                    cell.classList.add('station');
                    cell.innerHTML = '<i class="fas fa-train"></i>';
                    cellData.isStation = true;
                    break;
                case 'visited':
                    cell.classList.add('visited');
                    break;
                case 'path':
                    cell.classList.add('path');
                    break;
                case 'clear':
                    // Default empty cell
                    cell.innerHTML = '';
                    break;
            }
        }
        
        // Handle mouse events for drawing
        function handleMouseDown(event) {
            if (isVisualizing) return;
            isMouseDown = true;
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            processCell(row, col);
        }
        
        function handleMouseEnter(event) {
            if (isVisualizing) return;
            if (isMouseDown) {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                processCell(row, col);
            }
        }
        
        function handleMouseUp() {
            isMouseDown = false;
        }
        
        function processCell(row, col) {
            // Don't process if it's start or end cell
            if ((row === startCell.row && col === startCell.col) || 
                (row === endCell.row && col === endCell.col)) {
                return;
            }
            
            switch(selectedTool) {
                case 'start':
                    // Move start point
                    updateCell(startCell.row, startCell.col, 'clear');
                    updateCell(row, col, 'start');
                    break;
                case 'end':
                    // Move end point
                    updateCell(endCell.row, endCell.col, 'clear');
                    updateCell(row, col, 'end');
                    break;
                case 'wall':
                    // Toggle wall
                    if (grid[row][col].isWall) {
                        updateCell(row, col, 'clear');
                    } else {
                        updateCell(row, col, 'wall');
                    }
                    break;
                case 'weight':
                    // Toggle weight
                    if (grid[row][col].isWeight) {
                        updateCell(row, col, 'clear');
                    } else {
                        updateCell(row, col, 'weight');
                    }
                    break;
                case 'station':
                    // Toggle station
                    if (grid[row][col].isStation) {
                        updateCell(row, col, 'clear');
                    } else {
                        updateCell(row, col, 'station');
                    }
                    break;
            }
        }
        
        // Clear the path (visited and path cells)
        function clearPath() {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (grid[row][col].element.classList.contains('visited') || 
                        grid[row][col].element.classList.contains('path')) {
                        updateCell(row, col, 'clear');
                    }
                }
            }
            document.getElementById('path-length').textContent = '0';
            document.getElementById('nodes-visited').textContent = '0';
            document.getElementById('time-taken').textContent = '0ms';
            document.getElementById('weights-used').textContent = '0';
        }
        
        // Clear the entire board (except start and end)
        function clearBoard() {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if ((row === startCell.row && col === startCell.col) || 
                        (row === endCell.row && col === endCell.col)) {
                        continue;
                    }
                    updateCell(row, col, 'clear');
                }
            }
            clearPath();
        }
        
        // Generate a random maze
        function generateRandomMaze() {
            clearBoard();
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    // Skip start and end cells
                    if ((row === startCell.row && col === startCell.col) || 
                        (row === endCell.row && col === endCell.col)) {
                        continue;
                    }
                    
                    // 25% chance to be a wall
                    if (Math.random() < 0.25) {
                        updateCell(row, col, 'wall');
                    }
                    
                    // 10% chance to be a weight
                    if (Math.random() < 0.1) {
                        updateCell(row, col, 'weight');
                    }
                }
            }
        }
        
        // Get neighbors for a cell
        function getNeighbors(node, directions) {
            const neighbors = [];
            const row = node.row;
            const col = node.col;
            
            // Define direction vectors
            const dir4 = [
                {dr: -1, dc: 0}, // Up
                {dr: 0, dc: 1},  // Right
                {dr: 1, dc: 0},  // Down
                {dr: 0, dc: -1}  // Left
            ];
            
            const dir8 = [
                {dr: -1, dc: 0},  // Up
                {dr: -1, dc: 1},  // Up-Right
                {dr: 0, dc: 1},   // Right
                {dr: 1, dc: 1},   // Down-Right
                {dr: 1, dc: 0},   // Down
                {dr: 1, dc: -1},  // Down-Left
                {dr: 0, dc: -1},  // Left
                {dr: -1, dc: -1}  // Up-Left
            ];
            
            const dirs = (directions === 4) ? dir4 : dir8;
            
            for (const dir of dirs) {
                const newRow = row + dir.dr;
                const newCol = col + dir.dc;
                
                // Check if within grid bounds
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    // Skip walls
                    if (!grid[newRow][newCol].isWall) {
                        neighbors.push(grid[newRow][newCol]);
                    }
                }
            }
            
            return neighbors;
        }
        
        // BFS Algorithm
        function bfs() {
            const startNode = grid[startCell.row][startCell.col];
            const endNode = grid[endCell.row][endCell.col];
            
            const visited = [];
            const queue = [startNode];
            const cameFrom = {};
            cameFrom[`${startNode.row},${startNode.col}`] = null;
            
            while (queue.length > 0) {
                const currentNode = queue.shift();
                
                // Skip if already visited
                if (visited.some(node => node === currentNode)) continue;
                
                visited.push(currentNode);
                
                // Check if we reached the end
                if (currentNode === endNode) {
                    return { visited, path: reconstructPath(cameFrom, endNode) };
                }
                
                // Get neighbors
                const neighbors = getNeighbors(currentNode, directions);
                
                for (const neighbor of neighbors) {
                    const key = `${neighbor.row},${neighbor.col}`;
                    
                    // If we haven't visited this node
                    if (!cameFrom.hasOwnProperty(key)) {
                        queue.push(neighbor);
                        cameFrom[key] = currentNode;
                    }
                }
            }
            
            return { visited, path: [] };
        }
        
        // DFS Algorithm
        function dfs() {
            const startNode = grid[startCell.row][startCell.col];
            const endNode = grid[endCell.row][endCell.col];
            
            const visited = [];
            const stack = [startNode];
            const cameFrom = {};
            cameFrom[`${startNode.row},${startNode.col}`] = null;
            
            while (stack.length > 0) {
                const currentNode = stack.pop();
                
                // Skip if already visited
                if (visited.some(node => node === currentNode)) continue;
                
                visited.push(currentNode);
                
                // Check if we reached the end
                if (currentNode === endNode) {
                    return { visited, path: reconstructPath(cameFrom, endNode) };
                }
                
                // Get neighbors
                const neighbors = getNeighbors(currentNode, directions);
                
                for (const neighbor of neighbors) {
                    const key = `${neighbor.row},${neighbor.col}`;
                    
                    // If we haven't visited this node
                    if (!cameFrom.hasOwnProperty(key)) {
                        stack.push(neighbor);
                        cameFrom[key] = currentNode;
                    }
                }
            }
            
            return { visited, path: [] };
        }
        
        // Dijkstra's Algorithm
        function dijkstra() {
            const startNode = grid[startCell.row][startCell.col];
            const endNode = grid[endCell.row][endCell.col];
            
            // Initialize distances and visited array
            const distances = {};
            const visited = [];
            const cameFrom = {};
            const priorityQueue = [];
            
            // Set initial distances
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const key = `${row},${col}`;
                    distances[key] = Infinity;
                }
            }
            
            // Start node has 0 distance
            const startKey = `${startNode.row},${startNode.col}`;
            distances[startKey] = 0;
            priorityQueue.push({ node: startNode, distance: 0 });
            cameFrom[startKey] = null;
            
            while (priorityQueue.length > 0) {
                // Sort by distance and get the closest node
                priorityQueue.sort((a, b) => a.distance - b.distance);
                const { node: currentNode } = priorityQueue.shift();
                
                // Skip if already visited
                if (visited.some(node => node === currentNode)) continue;
                
                visited.push(currentNode);
                
                // Check if we reached the end
                if (currentNode === endNode) {
                    return { visited, path: reconstructPath(cameFrom, endNode) };
                }
                
                // Get neighbors
                const neighbors = getNeighbors(currentNode, directions);
                
                for (const neighbor of neighbors) {
                    const neighborKey = `${neighbor.row},${neighbor.col}`;
                    const cost = neighbor.isWeight ? 10 : 1;
                    const newDistance = distances[`${currentNode.row},${currentNode.col}`] + cost;
                    
                    // If we found a shorter path to this neighbor
                    if (newDistance < distances[neighborKey]) {
                        distances[neighborKey] = newDistance;
                        cameFrom[neighborKey] = currentNode;
                        priorityQueue.push({ node: neighbor, distance: newDistance });
                    }
                }
            }
            
            return { visited, path: [] };
        }
        
        // A* Algorithm
        function aStar() {
            const startNode = grid[startCell.row][startCell.col];
            const endNode = grid[endCell.row][endCell.col];
            
            // Heuristic function (Manhattan distance)
            const heuristic = (node) => {
                return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
            };
            
            // Initialize data structures
            const openSet = [startNode];
            const cameFrom = {};
            const gScore = {};
            const fScore = {};
            
            // Set initial scores
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const key = `${row},${col}`;
                    gScore[key] = Infinity;
                    fScore[key] = Infinity;
                }
            }
            
            // Start node scores
            const startKey = `${startNode.row},${startNode.col}`;
            gScore[startKey] = 0;
            fScore[startKey] = heuristic(startNode);
            cameFrom[startKey] = null;
            
            const visited = [];
            
            while (openSet.length > 0) {
                // Find node with lowest fScore
                openSet.sort((a, b) => {
                    const aKey = `${a.row},${a.col}`;
                    const bKey = `${b.row},${b.col}`;
                    return fScore[aKey] - fScore[bKey];
                });
                
                const currentNode = openSet.shift();
                visited.push(currentNode);
                
                // Check if we reached the end
                if (currentNode === endNode) {
                    return { visited, path: reconstructPath(cameFrom, endNode) };
                }
                
                // Get neighbors
                const neighbors = getNeighbors(currentNode, directions);
                
                for (const neighbor of neighbors) {
                    const neighborKey = `${neighbor.row},${neighbor.col}`;
                    
                    // Calculate tentative gScore
                    const cost = neighbor.isWeight ? 10 : 1;
                    const tentativeGScore = gScore[`${currentNode.row},${currentNode.col}`] + cost;
                    
                    if (tentativeGScore < gScore[neighborKey]) {
                        // This path to neighbor is better than any previous one
                        cameFrom[neighborKey] = currentNode;
                        gScore[neighborKey] = tentativeGScore;
                        fScore[neighborKey] = gScore[neighborKey] + heuristic(neighbor);
                        
                        if (!openSet.includes(neighbor)) {
                            openSet.push(neighbor);
                        }
                    }
                }
            }
            
            return { visited, path: [] };
        }
        
        // Reconstruct the path from cameFrom dictionary
        function reconstructPath(cameFrom, endNode) {
            const path = [];
            let currentNode = endNode;
            
            while (currentNode !== null) {
                path.unshift(currentNode);
                const key = `${currentNode.row},${currentNode.col}`;
                currentNode = cameFrom[key];
            }
            
            return path;
        }
        
        // Visualize the selected algorithm
        function visualizeAlgorithm() {
            if (isVisualizing) return;
            isVisualizing = true;
            clearPath();
            resetStats();
            
            const startNode = grid[startCell.row][startCell.col];
            const endNode = grid[endCell.row][endCell.col];
            
            let result;
            const startTime = performance.now();
            
            switch (selectedAlgo) {
                case 'bfs':
                    result = bfs();
                    break;
                case 'dfs':
                    result = dfs();
                    break;
                case 'dijkstra':
                    result = dijkstra();
                    break;
                case 'astar':
                    result = aStar();
                    break;
            }
            
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            
            const visitedNodes = result.visited;
            const path = result.path;
            
            // Update statistics
            document.getElementById('time-taken').textContent = timeTaken.toFixed(2) + 'ms';
            document.getElementById('nodes-visited').textContent = visitedNodes.length;
            document.getElementById('path-length').textContent = path.length - 1; // Exclude start node
            
            // Count weights in path
            let weightsCount = 0;
            for (const node of path) {
                if (node.isWeight) weightsCount++;
            }
            document.getElementById('weights-used').textContent = weightsCount;
            
            // Animate the visited nodes
            for (let i = 0; i < visitedNodes.length; i++) {
                setTimeout(() => {
                    const node = visitedNodes[i];
                    if (node !== startNode && node !== endNode) {
                        updateCell(node.row, node.col, 'visited');
                    }
                }, i * visualizationSpeed);
            }
            
            // Animate the path after all nodes are visited
            setTimeout(() => {
                for (let i = 0; i < path.length; i++) {
                    setTimeout(() => {
                        const node = path[i];
                        if (node !== startNode && node !== endNode) {
                            updateCell(node.row, node.col, 'path');
                        }
                    }, i * visualizationSpeed * 2);
                }
                
                // Re-enable visualization
                setTimeout(() => {
                    isVisualizing = false;
                }, path.length * visualizationSpeed * 2);
            }, visitedNodes.length * visualizationSpeed);
        }
        
        // Reset statistics
        function resetStats() {
            document.getElementById('path-length').textContent = '0';
            document.getElementById('nodes-visited').textContent = '0';
            document.getElementById('time-taken').textContent = '0ms';
            document.getElementById('weights-used').textContent = '0';
        }
        
        // Add obstacles randomly
        function addRandomObstacles() {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if ((row === startCell.row && col === startCell.col) || 
                        (row === endCell.row && col === endCell.col)) {
                        continue;
                    }
                    
                    // 15% chance to be a wall
                    if (Math.random() < 0.15 && !grid[row][col].isWall) {
                        updateCell(row, col, 'wall');
                    }
                }
            }
        }
        
        // Add weights randomly
        function addRandomWeights() {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if ((row === startCell.row && col === startCell.col) || 
                        (row === endCell.row && col === endCell.col) ||
                        grid[row][col].isWall) {
                        continue;
                    }
                    
                    // 10% chance to be a weight
                    if (Math.random() < 0.1 && !grid[row][col].isWeight) {
                        updateCell(row, col, 'weight');
                    }
                }
            }
        }
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            initializeGrid();
            
            // Algorithm selection
            document.querySelectorAll('.algo-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedAlgo = btn.dataset.algo;
                });
            });
            
            // Tool selection
            document.querySelectorAll('[data-tool]').forEach(btn => {
                btn.addEventListener('click', () => {
                    selectedTool = btn.dataset.tool;
                    // Update UI to show selected tool
                    document.querySelectorAll('[data-tool]').forEach(b => {
                        b.classList.remove('btn-primary');
                    });
                    btn.classList.add('btn-primary');
                });
            });
            
            // Set wall as default selected tool
            document.querySelector('[data-tool="wall"]').classList.add('btn-primary');
            
            // Maze generation
            document.getElementById('random-maze').addEventListener('click', generateRandomMaze);
            
            // Recursive division maze
            document.getElementById('recursive-maze').addEventListener('click', () => {
                clearBoard();
                addRecursiveDivision(0, 0, COLS, ROWS);
            });
            
            // Spiral maze
            document.getElementById('spiral-maze').addEventListener('click', () => {
                clearBoard();
                addSpiralMaze();
            });
            
            // Control buttons
            document.getElementById('visualize-btn').addEventListener('click', visualizeAlgorithm);
            document.getElementById('clear-path').addEventListener('click', clearPath);
            document.getElementById('clear-board').addEventListener('click', clearBoard);
            
            // Additional controls
            document.getElementById('add-obstacles').addEventListener('click', addRandomObstacles);
            document.getElementById('add-weights').addEventListener('click', addRandomWeights);
            
            // Speed slider
            document.getElementById('speed-slider').addEventListener('input', (e) => {
                const value = e.target.value;
                visualizationSpeed = 100 - value; // Invert so higher = faster
                
                // Update label
                let speedText;
                if (value < 30) speedText = 'Slow';
                else if (value < 70) speedText = 'Medium';
                else speedText = 'Fast';
                
                document.getElementById('speed-value').textContent = speedText;
            });
            
            // Directions slider
            document.getElementById('dir-slider').addEventListener('input', (e) => {
                directions = e.target.value === '1' ? 4 : 8;
                document.getElementById('dir-value').textContent = `${directions} Directions`;
            });
        });
        
        // Simplified recursive division for demo
        function addRecursiveDivision(x, y, width, height) {
            if (width < 3 || height < 3) return;
            
            // Horizontal or vertical division?
            const horizontal = Math.random() > 0.5;
            
            if (horizontal) {
                // Horizontal wall
                const wallY = Math.floor(y + Math.random() * (height - 2)) + 1;
                const gapX = Math.floor(x + Math.random() * width);
                
                for (let col = x; col < x + width; col++) {
                    if (col !== gapX && wallY >= 0 && wallY < ROWS && col >= 0 && col < COLS) {
                        updateCell(wallY, col, 'wall');
                    }
                }
                
                // Recurse on top and bottom sections
                addRecursiveDivision(x, y, width, wallY - y);
                addRecursiveDivision(x, wallY + 1, width, y + height - wallY - 1);
            } else {
                // Vertical wall
                const wallX = Math.floor(x + Math.random() * (width - 2)) + 1;
                const gapY = Math.floor(y + Math.random() * height);
                
                for (let row = y; row < y + height; row++) {
                    if (row !== gapY && row >= 0 && row < ROWS && wallX >= 0 && wallX < COLS) {
                        updateCell(row, wallX, 'wall');
                    }
                }
                
                // Recurse on left and right sections
                addRecursiveDivision(x, y, wallX - x, height);
                addRecursiveDivision(wallX + 1, y, x + width - wallX - 1, height);
            }
        }
        
        // Create a spiral maze
        function addSpiralMaze() {
            const centerRow = Math.floor(ROWS / 2);
            const centerCol = Math.floor(COLS / 2);
            let row = centerRow;
            let col = centerCol;
            let step = 1;
            let direction = 0; // 0: right, 1: down, 2: left, 3: up
            let stepsInDirection = 1;
            
            // Start from center
            updateCell(row, col, 'wall');
            
            while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                for (let i = 0; i < stepsInDirection; i++) {
                    switch(direction) {
                        case 0: col++; break;
                        case 1: row++; break;
                        case 2: col--; break;
                        case 3: row--; break;
                    }
                    
                    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                        updateCell(row, col, 'wall');
                    }
                }
                
                // Change direction
                direction = (direction + 1) % 4;
                
                // Every two turns, increase steps
                if (direction % 2 === 0) {
                    stepsInDirection++;
                }
                
                step++;
            }
        }
