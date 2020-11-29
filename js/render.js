import { graph, onClickEvent, simulator } from "./index.js";
import { NodeStatus } from "./graph.js";
const createGridElement = () => {
    const gridContainer = document.querySelector("#grid-container");
    while (gridContainer?.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    for (let gridY = 0; gridY < graph.y; gridY++) {
        const gridRowDiv = document.createElement("div");
        gridRowDiv.className = "grid-row";
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
};
const updateGridElement = () => {
    const gridContainer = document.querySelector("#grid-container");
    let x = 0;
    let y = 0;
    for (const gridRow of gridContainer.children) {
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
};
const getNodeAdjacencies = (node) => {
    const adjacencies = {
        up: false,
        down: false,
        right: false,
        left: false
    };
    const adjacentNodes = node.edges;
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
};
const getRoadImageSrc = (node) => {
    let imageSrc = "abc";
    const a = getNodeAdjacencies(node);
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
};
const renderDrivers = () => {
    const driverDivs = document.querySelectorAll(".driver-img");
    driverDivs.forEach(div => {
        div.remove();
    });
    for (const driver of simulator.drivers) {
        const gridUnitId = `${driver.location.x},${driver.location.y}`;
        const gridUnit = document.getElementById(gridUnitId);
        const driverImg = document.createElement("img");
        driverImg.className = "driver-img";
        driverImg.src = "img/driver.png";
        driverImg.addEventListener("click", (e) => onClickEvent(e));
        gridUnit?.appendChild(driverImg);
    }
};
export { createGridElement, updateGridElement, renderDrivers };
