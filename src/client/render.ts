import { graph, onClickEvent, simulator } from "./index.js";
import { GraphNode, NodeStatus } from "./graph.js";

// Create the grid element and generate the graph nodes
const createGridElement = () => {
    const gridContainer = document.querySelector("#grid-container") as HTMLDivElement;
    while (gridContainer?.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }

    // Create grid rows (y-axis)
    for (let gridY = 0; gridY < graph.y; gridY++) {
        const gridRowDiv = document.createElement("div");
        gridRowDiv.className = "grid-row";
        // Create grid units (x-axis)
        for (let gridX = 0; gridX < graph.x; gridX++) {
            const gridUnit = document.createElement("div");
            const gridUnitNode = graph.findNodeByCoordinates(gridX, gridY);
            const gridUnitImg = document.createElement("img");
            gridUnitImg.className = "grid-unit-img";
            gridUnitImg.addEventListener("click", (e) => onClickEvent(e));
            switch (gridUnitNode.status) {
                case NodeStatus.Road:
                    gridUnitImg.src = getRoadImageSrc(gridUnitNode);
                    break;
                case NodeStatus.City:
                    gridUnitImg.src = "img/city.png";
                    break;
                case NodeStatus.Empty:
                default:
                    gridUnitImg.src = "img/empty.png";
            }
            gridUnit.appendChild(gridUnitImg);
            gridUnit.className = `grid-unit ${gridUnitNode.status}`;
            gridUnit.id = `${gridX},${gridY}`;
            gridRowDiv.appendChild(gridUnit);
        }
        gridContainer?.appendChild(gridRowDiv);
    }
}

// Update the changed nodes since last update
const updateGridElement = () => {
    const gridContainer = document.querySelector("#grid-container") as HTMLDivElement;
    let x: number = 0;
    let y: number = 0;
    for (const gridRow of gridContainer.children as any) {
        for (const gridUnit of gridRow.children) {
            const gridUnitNode = graph.findNodeByCoordinates(x, y);
            const gridUnitImg = gridUnit.querySelector(".grid-unit-img");
            switch (gridUnitNode.status) {
                case NodeStatus.Road:
                    gridUnitImg.src = getRoadImageSrc(gridUnitNode);
                    break;
                case NodeStatus.City:
                    gridUnitImg.src = "img/city.png";
                    break;
                case NodeStatus.Empty:
                default:
                    gridUnitImg.src = "img/empty.png";
            }
            gridUnit.className = `grid-unit ${gridUnitNode.status}`;
            x++;
        }
        x = 0;
        y++;
    }
}

// Check the directions of nodes edge nodes
const getNodeAdjacencies = (node: GraphNode): Object => {
    const adjacencies = {
        up: false,
        down: false,
        right: false,
        left: false
    };
    const adjacentNodes: Array<GraphNode> = node.edges;
    for (const adjacentNode of adjacentNodes) {
        if (node.x === adjacentNode.x && node.y === adjacentNode.y + 1) {
            adjacencies.up = true;
            continue;
        }
        if (node.x === adjacentNode.x && node.y === adjacentNode.y - 1) {
            adjacencies.down = true;
            continue;
        }
        if (node.x === adjacentNode.x - 1 && node.y === adjacentNode.y) {
            adjacencies.right = true;
            continue;
        }
        if (node.x === adjacentNode.x + 1 && node.y === adjacentNode.y) {
            adjacencies.left = true;
            continue;
        }
    }
    return adjacencies;
}

// Determine the road image by checking its edge nodes
const getRoadImageSrc = (node: GraphNode): string => {
    let imageSrc: string = "abc";
    const a: any = getNodeAdjacencies(node);
    switch (true) {
        case a.up && !a.down && !a.right && !a.left:
            imageSrc = "img/road-up.png";
            break;
        case !a.up && a.down && !a.right && !a.left:
            imageSrc = "img/road-down.png";
            break;
        case !a.up && !a.down && a.right && !a.left:
            imageSrc = "img/road-right.png";
            break;
        case !a.up && !a.down && !a.right && a.left:
            imageSrc = "img/road-left.png";
            break;
        case a.up && a.down && !a.right && !a.left:
            imageSrc = "img/road-up-down.png";
            break;
        case !a.up && !a.down && a.right && a.left:
            imageSrc = "img/road-left-right.png";
            break;
        case a.up && !a.down && !a.right && a.left:
            imageSrc = "img/road-up-left.png";
            break;
        case a.up && !a.down && a.right && !a.left:
            imageSrc = "img/road-up-right.png";
            break;
        case !a.up && a.down && !a.right && a.left:
            imageSrc = "img/road-down-left.png";
            break;
        case !a.up && a.down && a.right && !a.left:
            imageSrc = "img/road-down-right.png";
            break;
        case a.up && a.down && a.right && !a.left:
            imageSrc = "img/road-t-right.png";
            break;
        case a.up && a.down && !a.right && a.left:
            imageSrc = "img/road-t-left.png";
            break;
        case a.up && !a.down && a.right && a.left:
            imageSrc = "img/road-t-up.png";
            break;
        case !a.up && a.down && a.right && a.left:
            imageSrc = "img/road-t-down.png";
            break;
        case a.left && a.right && a.down && a.up:
            imageSrc = "img/road-cross.png";
            break;
        default:
            imageSrc = "img/road-cross.png";
    }
    return imageSrc;
}

// Render the drivers
const renderDrivers = () => {
    const driverDivs = document.querySelectorAll(".driver-img");
    driverDivs.forEach(div => {
        div.remove();
    });

    for (const driver of simulator.drivers) {
        const gridUnitId = `${driver.location.x},${driver.location.y}`;
        const gridUnit = document.getElementById(gridUnitId);
        const driverImg = document.createElement("img");
        driverImg.className ="driver-img";
        driverImg.src = "img/driver.png";
        driverImg.addEventListener("click", (e) => onClickEvent(e));
        gridUnit?.appendChild(driverImg);
    }
}

export { createGridElement, updateGridElement, renderDrivers }