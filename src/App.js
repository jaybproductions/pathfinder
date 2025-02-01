import { useEffect, useState } from 'react';

const App = () => {
  const [visited, setVisited] = useState(new Set());
  const [path, setPath] = useState([]);
  const [arr, setArr] = useState([]);
  const [goal, setGoal] = useState([]);

  function generateGridWithPath(rows, cols) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(1)); // Fill with walls

    // Random start and goal positions
    const startX = Math.floor(Math.random() * rows);
    const startY = Math.floor(Math.random() * cols);
    let goalX = Math.floor(Math.random() * rows);
    let goalY = Math.floor(Math.random() * cols);

    // Ensure start and goal are not the same
    while (startX === goalX && startY === goalY) {
        goalX = Math.floor(Math.random() * rows);
        goalY = Math.floor(Math.random() * cols);
    }

    // Create a guaranteed path from start to goal
    let currentX = startX;
    let currentY = startY;
    grid[currentX][currentY] = 0; // Mark start as open

    while (currentX !== goalX || currentY !== goalY) {
        if (currentX !== goalX && (Math.random() < 0.5 || currentY === goalY)) {
            currentX += currentX < goalX ? 1 : -1;
        } else {
            currentY += currentY < goalY ? 1 : -1;
        }
        grid[currentX][currentY] = 0; // Carve the path
    }

    // Place the goal
    grid[goalX][goalY] = 2;

    // Randomly fill the remaining grid with open spaces and walls
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) { // Only overwrite if it's still a wall
                grid[i][j] = Math.random() < 0.3 ? 1 : 0; // 30% chance of wall
            }
        }
    }

    console.log(`Goal at: (${goalX}, ${goalY})`);
    return { grid, goal: [goalX, goalY] };
}

  useEffect(() => {
      setGridAndGoal();
  }, []);


  const setGridAndGoal = () => {
    setVisited(new Set());
    setPath([]);
    const { grid, goal } = generateGridWithPath(10, 25);
    setArr(grid);
    setGoal(goal)
  }


    const DIR = [[0, 1], [0, -1], [-1, 0], [1, 0]];

    class Node {
        constructor(node, g, h, parent = null) {
            this.node = node;
            this.g = g;
            this.h = h;
            this.parent = parent;
        }
    }

    const heuristic = (x, y, goalX, goalY) => Math.abs(x - goalX) + Math.abs(y - goalY);

    const reconstructPath = (node) => {
        let path = [];
        while (node) {
            path.push(node.node);
            node = node.parent;
        }
        return path.reverse();
    };

    const runAStar = async (start) => {
      setVisited(new Set());
      setPath([]);
        let newVisited = new Set();
        let queue = [new Node(start, 0, heuristic(start[0], start[1], goal[0], goal[1]))];

        while (queue.length) {
            queue.sort((a, b) => (a.g + a.h) - (b.g + b.h));
            let currentNode = queue.shift();
            let { node, g, h, parent } = currentNode;
            let [x, y] = node;

            if (x === goal[0] && y === goal[1]) {
                console.log("Path found!");
                setPath(reconstructPath(currentNode));
                return;
            }

            for (const [dx, dy] of DIR) {
                let newX = x + dx, newY = y + dy;

                if (newX < 0 || newX >= arr.length || newY < 0 || newY >= arr[newX].length || arr[newX][newY] === 1) {
                    continue;
                }

                let key = `${newX},${newY}`;
                if (!newVisited.has(key)) {
                    newVisited.add(key);
                    queue.push(new Node([newX, newY], g + 1, heuristic(newX, newY, goal[0], goal[1]), currentNode));
                    setVisited(new Set(newVisited)); // Trigger React update
                    await new Promise((r) => setTimeout(r, 100)); // Add delay for visualization
                }
            }
        }
    };

    return (
<>
  <div className="app-container">
    <button className="find-path-btn" onClick={() => runAStar([0, 0])}>
      Find Path
    </button>
    <button className="find-path-btn" onClick={() => setGridAndGoal()}>
      Generate New Grid
    </button>
    <div className="grid-container">
      {arr.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isVisited = visited.has(`${rowIndex},${colIndex}`);
          const isPath = path.some(([x, y]) => x === rowIndex && y === colIndex);
          const isGoal = goal[0] === rowIndex && goal[1] === colIndex;

          let cellClass = "cell cell-empty";
          if (cell === 1) cellClass = "cell cell-wall";
          if (isVisited) cellClass = "cell cell-visited";
          if (isPath) cellClass = "cell cell-path";
          if (isGoal) cellClass = "cell cell-goal";

          return <div key={`${rowIndex}-${colIndex}`} className={cellClass}></div>;
        })
      )}
    </div>
  </div>
</>
    );
};

export default App;
