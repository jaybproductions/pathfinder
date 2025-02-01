import { useEffect, useState } from 'react';

const App = () => {
    
    const [arr, setArr] = useState([
        [0, 1, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 1, 0, 1, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 1, 2, 1],
        [0, 1, 0, 0, 0, 1, 0, 0, 0],
    ]);

    const [goal, setGoal] = useState([4, 7]);
    const [visited, setVisited] = useState(new Set());
    const [path, setPath] = useState([]);

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
