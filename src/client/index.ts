import Graph from "./graph.js";
import Simulator from "./simulator.js";
import { createGridElement, updateGridElement } from "./render.js";

// Global variables
const xInput = document.querySelector("#x-input") as HTMLInputElement;
const yInput = document.querySelector("#y-input") as HTMLInputElement;
const cityCountInput = document.querySelector("#cityCount-input") as HTMLInputElement;
const worldButton = document.querySelector("#world-button") as HTMLButtonElement;
const deleteModeButton = document.querySelector("#delete-button") as HTMLButtonElement;
const roadModeButton = document.querySelector("#road-button") as HTMLButtonElement;
const cityModeButton = document.querySelector("#city-button") as HTMLButtonElement;
const pauseButton = document.querySelector("#pause-button") as HTMLButtonElement;
const driverCountInput = document.querySelector("#driver-input") as HTMLInputElement;
const tickInput = document.querySelector("#tick-input") as HTMLButtonElement;
let deleteMode: boolean = false;
let roadMode: boolean = false;
let cityMode: boolean = false;
let firstTimeInit: boolean = true;
let xInputValue: number;
let yInputValue: number;
let cityCountInputValue: number;
let config: any;
let graph: Graph;
let simulator: Simulator;

// Handles all grid editing and node inspection
const onClickEvent = (e: Event) => {
    let targetDiv = e.target as HTMLDivElement;
    let isDriver: boolean = false;
    if (targetDiv.className === "driver-img") {
        isDriver = true;
    }
    targetDiv = targetDiv.parentElement as HTMLDivElement;
    
    const coordinates = targetDiv.id.split(",");
    const clickedNode = graph.findNodeByCoordinates(Number(coordinates[0]), Number(coordinates[1]));
    if (deleteMode === true && roadMode === false && cityMode === false) {
        graph.deleteNode(clickedNode);
    }
    if (roadMode === true && deleteMode === false && cityMode === false) {
        graph.addRoadNode(clickedNode);
    }
    if (cityMode === true && roadMode === false && deleteMode === false) {
        graph.addCityNode(clickedNode);
    }
    if (roadMode === false && deleteMode === false && cityMode === false) {
        console.log(clickedNode);
        if (isDriver) {
            console.log(simulator.getDriversInNode(clickedNode));
        }
    }
    updateGridElement();
}

const deleteModeOnOff = (button: HTMLButtonElement) => {
    if (deleteMode === true) {
        deleteMode = false;
        button.value = "Delete Mode: Off";
        roadModeButton.disabled = false;
        cityModeButton.disabled = false;
    } else {
        deleteMode = true;
        button.value = "Delete Mode: On";
        roadModeButton.disabled = true;
        cityModeButton.disabled = true;
    }
}

const roadModeButtonOnOff = (button: HTMLButtonElement) => {
    if (roadMode === true) {
        roadMode = false;
        button.value = "Road Mode: Off";
        deleteModeButton.disabled = false;
        cityModeButton.disabled = false;
    } else {
        roadMode = true;
        button.value = "Road Mode: On";
        deleteModeButton.disabled = true;
        cityModeButton.disabled = true;
    }
}

const cityModeButtonOnOff = (button: HTMLButtonElement) => {
    if (cityMode === true) {
        cityMode = false;
        button.value = "City Mode: Off";
        deleteModeButton.disabled = false;
        roadModeButton.disabled = false;
    } else {
        cityMode = true;
        button.value = "City Mode: On";
        deleteModeButton.disabled = true;
        roadModeButton.disabled = true;
    }
}

// Create eventlisteners for grid editing and simulation running when grid is created for the first time
const initEventListeners = () => {
    xInput.addEventListener("change", () => {
        xInputValue = Number(xInput.value);
    });
    yInput.addEventListener("change", () => {
        yInputValue = Number(yInput.value);
    });
    cityCountInput.addEventListener("change", () => {
        cityCountInputValue = Number(cityCountInput.value);
    });
    deleteModeButton.addEventListener("click", () => {
        deleteModeOnOff(deleteModeButton);
    });
    roadModeButton.addEventListener("click", () => {
        roadModeButtonOnOff(roadModeButton);
    });
    cityModeButton.addEventListener("click", () => {
        cityModeButtonOnOff(cityModeButton);
    });
    pauseButton.addEventListener("click", () => {
        simulator.startPauseSimulation();
        if (simulator.runSimulation) {
            pauseButton.value = "Pause simulation";
        } else {
            pauseButton.value = "Resume simulation";
        }
    });
    driverCountInput.value = String(simulator.driverCount);
    driverCountInput.addEventListener("change", () => {
        simulator.driverCount = Number(driverCountInput.value);
        simulator.createDrivers();
    });
    tickInput.value = String(simulator.tick);
    tickInput.addEventListener("change", () => {
        simulator.tick = Number(tickInput.value);
    });
}

const initGrid = () => {
    graph = new Graph(config, xInputValue, yInputValue, cityCountInputValue);
    createGridElement();
    simulator = new Simulator(config);
    
    if (firstTimeInit) {
        firstTimeInit = false;
        initEventListeners();
        deleteModeButton.disabled = false;
        roadModeButton.disabled = false;
        cityModeButton.disabled = false;
        pauseButton.disabled = false;
        driverCountInput.disabled = false;
        tickInput.disabled = false;
    } else {
        pauseButton.value = "Start simulation";
        simulator.driverCount = Number(driverCountInput.value);
        simulator.tick = Number(tickInput.value);
    }
}

// Sets up grid creation values when page is loaded
const initOnPageLoad = async () => {
    const configFetch = await fetch("/config.json");
    config = await configFetch.json();
    console.log("Config", config);

    xInputValue = config.grid.x;
    xInput.value = String(xInputValue);
    yInputValue = config.grid.y;
    yInput.value = String(yInputValue);
    cityCountInputValue = config.grid.cityCount;
    cityCountInput.value = String(cityCountInputValue);
    worldButton.addEventListener("click", () => initGrid());
}
initOnPageLoad();

export { graph, simulator, onClickEvent }