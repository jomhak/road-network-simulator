enum NodeStatus {
    Empty = "empty",
    Road = "road",
    City = "city"
}

interface GraphNode {
    status: NodeStatus,
    name: string,
    x: number,
    y: number
    edges: Array<GraphNode>
}

// Graph class controls the graph, updates its nodes and edges as needed and provides graph travelsal routes
class Graph {
    nodes: Array<GraphNode>;
    x: number;
    y: number;
    cities: Array<GraphNode>;
    cityNames: Array<string>;

    constructor(config: any, x: number, y: number, cityCount: number) {
        this.nodes = this.createEmptyNodes(x, y);
        this.x = x;
        this.y = y;
        this.cityNames = [...config.cityNames];
        this.cities = this.createCities(cityCount);
        this.createRoads();
        this.createEdges();
        console.log("Graph nodes", this.nodes);
    }

    // Creates the empty base nodes for the graph
    createEmptyNodes(x: number, y: number): Array<GraphNode> {
        const nodes: Array<GraphNode> = [];
        for (let yAxis = 0; yAxis < y; yAxis++) {
            for (let xAxis = 0; xAxis < x; xAxis++) {
                const node: GraphNode = {
                    status: NodeStatus.Empty,
                    name: "",
                    x: xAxis,
                    y: yAxis,
                    edges: []
                }
                nodes.push(node);
            }
        }
        return nodes;
    }

    // Create cities to random positions on the empty graph
    createCities(cityCount: number): Array<GraphNode> {
        // Generate random city positions while checking that they don't generate next to each other
        const cities: Array<GraphNode> = [];
        while (cities.length < cityCount) {
            const newCity: GraphNode = this.getRandomNode();
            if (cities.length > 0) {
                let isTooClose: boolean = false;
                for (const city of cities) {
                    if (this.isCityTooClose(city, newCity)) {
                        isTooClose = true;
                        break;
                    }
                }
                // If true, jump to start and create new random city position
                if (isTooClose) {
                    continue;
                }
            }
            newCity.name = this.cityNames[(Math.floor(Math.random() * this.cityNames.length))];
            newCity.status = NodeStatus.City;
            cities.push(newCity);
        }
        return cities;
    }

    // Create roads to connect cities. All cities are connected to 2 cities but depending on the positions of other cities, they can have 3 or 4 road nodes around them.
    createRoads() {
        const cities: Array<GraphNode> = this.cities;
        const roads: Array<GraphNode> = [];
        for (let i = 0; i < cities.length; i++) {
            const baseCity: GraphNode = cities[i];
            // If cities array run out of cities, start from beginning
            const targetCity: GraphNode = i + 1 >= cities.length ? cities[i + 1 - cities.length] : cities[i + 1];

            // Determine the distance between the cities and also the actions and direction required to create a road between them. Only creates roads with a maximum of 1 turn
            const distanceX: number = baseCity.x - targetCity.x;
            const actionsX: number = Math.abs(distanceX);
            const directionX: number = distanceX > 0 ? -1 : 1;
            const distanceY: number = baseCity.y - targetCity.y;
            const actionsY: number = Math.abs(distanceY);
            const directionY: number = distanceY > 0 ? -1 : 1;

            let previousNode: GraphNode = baseCity;
            let newNode: GraphNode;
            for (let x = 0; x < actionsX; x++) {
                newNode = this.findNodeByCoordinates(previousNode.x + directionX, previousNode.y);
                previousNode = newNode;
                if (newNode.status === NodeStatus.City) {
                    continue;
                }
                previousNode.status = NodeStatus.Road;
                roads.push(previousNode);
            }
            
            for (let y = 0; y < actionsY; y++) {
                newNode = this.findNodeByCoordinates(previousNode.x, previousNode.y + directionY);
                previousNode = newNode;
                if (newNode.status === NodeStatus.City) {
                    continue;
                }
                previousNode.status = NodeStatus.Road;
                roads.push(previousNode);
            }
        }
    }

    // Create edges for road and city nodes
    createEdges() {
        for (let node of this.nodes) {
            switch (node.status) {
                case NodeStatus.Empty:
                    continue;
                case NodeStatus.Road:
                case NodeStatus.City:
                    node.edges = this.findAdjacentNodes(node);
                    break;
            }
        }
    }

    findNodeByCoordinates(x: number, y: number): GraphNode {
        return this.nodes.filter(node => node.x === x && node.y === y)[0];
    }

    // Find the up, down, left and right nodes of a node
    findAdjacentNodes(node: GraphNode): Array<GraphNode> {
        const adjacentPoints = [
            {x: 0, y: 1},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: -1, y: 0}
        ]
        const adjacentNodes: Array<GraphNode> = [];
        for (const point of adjacentPoints) {
            const adjacentNode = this.findNodeByCoordinates(node.x + point.x, node.y + point.y);
            if (adjacentNode === undefined) {
                continue;
            }
            if (adjacentNode.status === NodeStatus.City || adjacentNode.status === NodeStatus.Road) {
                adjacentNodes.push(adjacentNode);
            }
        }
        return adjacentNodes;
    }

    getRandomNode(): GraphNode {
        const randomNumber: number = Math.floor(Math.random() * this.nodes.length);
        return this.nodes[randomNumber];
    }

    getRandomCity(): GraphNode {
        const randomNumber: number = Math.floor(Math.random() * this.cities.length);
        return this.cities[randomNumber];
    }

    // Return random city that is not the same as the parameter node
    getRandomCityWithException(node: GraphNode): GraphNode {
        const cities = this.cities.filter(city => city !== node);
        const randomNumber: number = Math.floor(Math.random() * cities.length);
        return cities[randomNumber];
    }

    deleteNode(deletedNode: GraphNode) {
        const adjacentNodes = this.findAdjacentNodes(deletedNode);
        for (const adjacentNode of adjacentNodes) {
            adjacentNode.edges = adjacentNode.edges.filter(node => node !== deletedNode);
        }
        if (deletedNode.status === NodeStatus.City) {
            this.cityNames.push(deletedNode.name);
            this.cities = this.cities.filter(node => node !== deletedNode);
        }

        deletedNode.edges.splice(0, 4);
        deletedNode.name = "";
        deletedNode.status = NodeStatus.Empty;
    }

    addCityNode(newCityNode: GraphNode) {
        if (newCityNode.status === NodeStatus.Empty) {
            const adjacentNodes = this.findAdjacentNodes(newCityNode);
            for (const adjacentNode of adjacentNodes) {
                adjacentNode.edges.push(newCityNode);
                newCityNode.edges.push(adjacentNode);
            }
        }

        newCityNode.name = this.cityNames[(Math.floor(Math.random() * this.cityNames.length))];
        newCityNode.status = NodeStatus.City;
        this.cities.push(newCityNode);
    }

    addRoadNode(newRoadNode: GraphNode) {
        if (newRoadNode.status === NodeStatus.Empty) {
            const adjacentNodes = this.findAdjacentNodes(newRoadNode);
            for (const adjacentNode of adjacentNodes) {
                adjacentNode.edges.push(newRoadNode);
                newRoadNode.edges.push(adjacentNode);
            }
        }
        if (newRoadNode.status === NodeStatus.City) {
            this.cities = this.cities.filter(node => node !== newRoadNode);
        }
        newRoadNode.name = "";
        newRoadNode.status = NodeStatus.Road;
    }

    // Compares two nodes to determine if they are too close (8 blocks around) to each other
    isCityTooClose(baseCity: GraphNode, targetCity: GraphNode): boolean {
        const points = [
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 1, y: 0},
            {x: 1, y: -1},
            {x: 0, y: -1},
            {x: -1, y: -1},
            {x: -1, y: 0},
            {x: -1, y: 1}
        ]
        let isTooClose: boolean = false;
        for (const point of points) {
            if (targetCity.x + point.x === baseCity.x &&
                targetCity.y + point.y === baseCity.y) {
                isTooClose = true;
            }
        }
        return isTooClose;
    }

    findRoute(origin: GraphNode, destination: GraphNode): Array<GraphNode> {
        return this.bfs(origin, destination);
    }

    // Bread-first search (bfs) searches all routes and determines the shortest
    bfs(origin: GraphNode, destination: GraphNode): any {
        const visited: Set<GraphNode> = new Set();
        const queue: Array<Array<GraphNode>> = [[origin]];
        let counter: number = 0;

        while (queue.length > 0) {
            counter++;
            const path: Array<GraphNode> = queue.shift() as Array<GraphNode>;
            const testableNodes: GraphNode = path[path.length - 1];

            if (testableNodes === destination) {
                console.log(`BFS found the destination in ${counter} jumps`);
                console.log("Route", path);
                return path;
            }
            if (!visited.has(testableNodes)) {
                for (const edgeNode of testableNodes.edges) {
                    const newPath = [...path];
                    newPath.push(edgeNode);
                    queue.push(newPath);
                }
                visited.add(testableNodes);
            }
        }
    }
}

export default Graph;
export { NodeStatus, GraphNode };