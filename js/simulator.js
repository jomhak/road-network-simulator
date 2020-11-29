import { NodeStatus } from "./graph.js";
import { graph } from "./index.js";
import { renderDrivers } from "./render.js";
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["Starting"] = "starting";
    DriverStatus["Calculating"] = "calculating";
    DriverStatus["Driving"] = "driving";
    DriverStatus["Arriving"] = "arriving";
})(DriverStatus || (DriverStatus = {}));
class Simulator {
    constructor(config) {
        this.drivers = [];
        this.driverCount = config.simulation.driverCount;
        this.driverId = 0;
        this.createDrivers();
        this.runSimulation = false;
        this.tick = config.simulation.tick;
    }
    createDrivers() {
        while (this.drivers.length < this.driverCount) {
            const origin = graph.getRandomCity();
            const destination = graph.getRandomCityWithException(origin);
            let status = DriverStatus.Starting;
            const route = graph.findRoute(origin, destination);
            if (route === undefined) {
                status = DriverStatus.Calculating;
            }
            const driver = {
                id: this.driverId,
                status: status,
                location: origin,
                origin: origin,
                destination: destination,
                route: route
            };
            console.log("New driver", driver);
            this.drivers.push(driver);
            this.driverId++;
        }
    }
    driveDrivers() {
        for (const driver of this.drivers) {
            switch (driver.status) {
                case DriverStatus.Starting:
                    driver.route.shift();
                    driver.status = DriverStatus.Driving;
                    break;
                case DriverStatus.Driving:
                    let nextNode;
                    if (driver.route.length > 0) {
                        nextNode = driver.route[0];
                        switch (nextNode?.status) {
                            case NodeStatus.Empty:
                                driver.status = DriverStatus.Calculating;
                                break;
                            case NodeStatus.Road:
                                driver.location = nextNode;
                                break;
                            case NodeStatus.City:
                                driver.location = nextNode;
                                if (nextNode === driver.destination) {
                                    driver.status = DriverStatus.Arriving;
                                }
                                break;
                            default:
                                driver.status = DriverStatus.Calculating;
                        }
                        driver.route.shift();
                    }
                    else {
                        driver.status = DriverStatus.Calculating;
                    }
                    break;
                case DriverStatus.Calculating:
                    const route = graph.findRoute(driver.location, driver.destination);
                    if (route === undefined || route.length <= 1) {
                        const routeToOrigin = graph.findRoute(driver.location, driver.origin);
                        if (routeToOrigin === undefined || routeToOrigin.length <= 1) {
                            driver.status = DriverStatus.Arriving;
                            console.log("No routes found");
                        }
                        else {
                            driver.route = routeToOrigin;
                            driver.status = DriverStatus.Starting;
                        }
                    }
                    else {
                        driver.route = route;
                        driver.status = DriverStatus.Starting;
                    }
                    break;
                case DriverStatus.Arriving:
                    this.drivers = this.drivers.filter(driverObject => driverObject !== driver);
                    break;
            }
        }
    }
    getDriversInNode(node) {
        return this.drivers.filter(driver => driver.location === node);
    }
    startPauseSimulation() {
        this.runSimulation = this.runSimulation ? false : true;
        this.simulationLoop();
    }
    async simulationLoop() {
        while (this.runSimulation) {
            this.driveDrivers();
            this.createDrivers();
            renderDrivers();
            await this.sleep();
        }
    }
    sleep() {
        return new Promise(resolve => setTimeout(resolve, this.tick));
    }
}
export default Simulator;
export { DriverStatus };
