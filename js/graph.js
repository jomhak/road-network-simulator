var NodeStatus;
(function (NodeStatus) {
    NodeStatus["Empty"] = "empty";
    NodeStatus["Road"] = "road";
    NodeStatus["City"] = "city";
})(NodeStatus || (NodeStatus = {}));
class Graph {
    constructor(config, x, y, cityCount) {
        this.nodes = this.createEmptyNodes(x, y);
        this.x = x;
        this.y = y;
        this.cityNames = [...config.cityNames];
        this.cities = this.createCities(cityCount);
        this.createRoads();
        this.createEdges();
        console.log("Graph nodes", this.nodes);
    }
    createEmptyNodes(x, y) {
        const nodes = [];
        for (let yAxis = 0; yAxis < y; yAxis++) {
            for (let xAxis = 0; xAxis < x; xAxis++) {
                const node = {
                    status: NodeStatus.Empty,
                    name: "",
                    x: xAxis,
                    y: yAxis,
                    edges: []
                };
                nodes.push(node);
            }
        }
        return nodes;
    }
    createCities(cityCount) {
        const cities = [];
        while (cities.length < cityCount) {
            const newCity = this.getRandomNode();
            if (cities.length > 0) {
                let isTooClose = false;
                for (const city of cities) {
                    if (this.isCityTooClose(city, newCity)) {
                        isTooClose = true;
                        break;
                    }
                }
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
    createRoads() {
        const cities = this.cities;
        const roads = [];
        for (let i = 0; i < cities.length; i++) {
            const baseCity = cities[i];
            const targetCity = i + 1 >= cities.length ? cities[i + 1 - cities.length] : cities[i + 1];
            const distanceX = baseCity.x - targetCity.x;
            const actionsX = Math.abs(distanceX);
            const directionX = distanceX > 0 ? -1 : 1;
            const distanceY = baseCity.y - targetCity.y;
            const actionsY = Math.abs(distanceY);
            const directionY = distanceY > 0 ? -1 : 1;
            let previousNode = baseCity;
            let newNode;
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
    findNodeByCoordinates(x, y) {
        return this.nodes.filter(node => node.x === x && node.y === y)[0];
    }
    findAdjacentNodes(node) {
        const adjacentPoints = [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: 0 }
        ];
        const adjacentNodes = [];
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
    getRandomNode() {
        const randomNumber = Math.floor(Math.random() * this.nodes.length);
        return this.nodes[randomNumber];
    }
    getRandomCity() {
        const randomNumber = Math.floor(Math.random() * this.cities.length);
        return this.cities[randomNumber];
    }
    getRandomCityWithException(node) {
        const cities = this.cities.filter(city => city !== node);
        const randomNumber = Math.floor(Math.random() * cities.length);
        return cities[randomNumber];
    }
    deleteNode(deletedNode) {
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
    addCityNode(newCityNode) {
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
    addRoadNode(newRoadNode) {
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
    isCityTooClose(baseCity, targetCity) {
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 1, y: -1 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: -1, y: 1 }
        ];
        let isTooClose = false;
        for (const point of points) {
            if (targetCity.x + point.x === baseCity.x &&
                targetCity.y + point.y === baseCity.y) {
                isTooClose = true;
            }
        }
        return isTooClose;
    }
    findRoute(origin, destination) {
        return this.bfs(origin, destination);
    }
    bfs(origin, destination) {
        const visited = new Set();
        const queue = [[origin]];
        let counter = 0;
        while (queue.length > 0) {
            counter++;
            const path = queue.shift();
            const testableNodes = path[path.length - 1];
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
export { NodeStatus };
