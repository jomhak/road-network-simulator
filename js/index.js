import Graph from "./graph.js";
import Simulator from "./simulator.js";
import { createGridElement, updateGridElement } from "./render.js";
const xInput = document.querySelector("#x-input");
const yInput = document.querySelector("#y-input");
const cityCountInput = document.querySelector("#cityCount-input");
const worldButton = document.querySelector("#world-button");
const deleteModeButton = document.querySelector("#delete-button");
const roadModeButton = document.querySelector("#road-button");
const cityModeButton = document.querySelector("#city-button");
const pauseButton = document.querySelector("#pause-button");
const driverCountInput = document.querySelector("#driver-input");
const tickInput = document.querySelector("#tick-input");
let deleteMode = false;
let roadMode = false;
let cityMode = false;
let firstTimeInit = true;
let xInputValue;
let yInputValue;
let cityCountInputValue;
let config;
let graph;
let simulator;
const onClickEvent = (e) => {
    let targetDiv = e.target;
    let isDriver = false;
    if (targetDiv.className === "driver-img") {
        isDriver = true;
    }
    targetDiv = targetDiv.parentElement;
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
};
const deleteModeOnOff = (button) => {
    if (deleteMode === true) {
        deleteMode = false;
        button.value = "Delete Mode: Off";
        roadModeButton.disabled = false;
        cityModeButton.disabled = false;
    }
    else {
        deleteMode = true;
        button.value = "Delete Mode: On";
        roadModeButton.disabled = true;
        cityModeButton.disabled = true;
    }
};
const roadModeButtonOnOff = (button) => {
    if (roadMode === true) {
        roadMode = false;
        button.value = "Road Mode: Off";
        deleteModeButton.disabled = false;
        cityModeButton.disabled = false;
    }
    else {
        roadMode = true;
        button.value = "Road Mode: On";
        deleteModeButton.disabled = true;
        cityModeButton.disabled = true;
    }
};
const cityModeButtonOnOff = (button) => {
    if (cityMode === true) {
        cityMode = false;
        button.value = "City Mode: Off";
        deleteModeButton.disabled = false;
        roadModeButton.disabled = false;
    }
    else {
        cityMode = true;
        button.value = "City Mode: On";
        deleteModeButton.disabled = true;
        roadModeButton.disabled = true;
    }
};
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
        }
        else {
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
};
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
    }
    else {
        pauseButton.value = "Start simulation";
        simulator.driverCount = Number(driverCountInput.value);
        simulator.tick = Number(tickInput.value);
    }
};
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
};
initOnPageLoad();
export { graph, simulator, onClickEvent };
