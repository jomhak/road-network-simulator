import { GraphNode, NodeStatus } from "./graph.js";
import { graph } from "./index.js";
import { renderDrivers } from "./render.js";

enum DriverStatus {
    Starting = "starting",
    Calculating = "calculating",
    Driving = "driving",
    Arriving = "arriving"
}

interface Driver {
    id: number,
    status: DriverStatus,
    location: GraphNode,
    origin: GraphNode,
    destination: GraphNode,
    route: Array<GraphNode>,
}

// Simulator class controls the driver objects that traverse the graph
class Simulator {
    drivers: Array<Driver>;
    driverCount: number;
    driverId: number;
    runSimulation: boolean;
    tick: number;

    constructor(config: any) {
        this.drivers = [];
        this.driverCount = config.simulation.driverCount;
        this.driverId = 0;
        this.createDrivers();
        this.runSimulation = false;
        this.tick = config.simulation.tick;
    }

    // Create drivers to random cities with random destinations
    createDrivers() {
        // Create new drivers if there isn't enough
        while(this.drivers.length < this.driverCount) {
            const origin: GraphNode = graph.getRandomCity();
            const destination: GraphNode = graph.getRandomCityWithException(origin);
            let status: DriverStatus = DriverStatus.Starting;
            const route = graph.findRoute(origin, destination);
            if (route === undefined) {
                status = DriverStatus.Calculating;
            }

            const driver: Driver = {
                id: this.driverId,
                status: status,
                location: origin,
                origin: origin,
                destination: destination,
                route: route
            }
            console.log("New driver", driver);
            this.drivers.push(driver);
            this.driverId++;
        }
    }

    // Controls the driver logic by reading their status
    driveDrivers() {
        for (const driver of this.drivers) {
            switch (driver.status) {
                // Starting: Driver was just created or received a new route
                case DriverStatus.Starting:
                    // First node in a route is the starting point, so remove it
                    driver.route.shift();
                    driver.status = DriverStatus.Driving;
                    break;
                // Driving: Driver is driving towards next node
                case DriverStatus.Driving:
                    let nextNode: GraphNode;    
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
                    } else {
                        driver.status = DriverStatus.Calculating;
                    }
                    break;
                // Calculating: Driver determines its if there is route to its destination or not
                case DriverStatus.Calculating:
                    // Check if a route to the destination exists
                    const route = graph.findRoute(driver.location, driver.destination);
                    if (route === undefined || route.length <= 1) {
                        // Check if a route back to the origin exists
                        const routeToOrigin = graph.findRoute(driver.location, driver.origin);
                        if (routeToOrigin === undefined || routeToOrigin.length <= 1) {
                            // No routes to destination or origin. Driver gives up.
                            driver.status = DriverStatus.Arriving;
                            console.log("No routes found");
                        } else {
                            driver.route = routeToOrigin;
                            driver.status = DriverStatus.Starting;
                        }
                    } else {
                        driver.route = route;
                        driver.status = DriverStatus.Starting;
                    }
                    break;
                // Arriving: Driver is ending its journey.
                case DriverStatus.Arriving:
                    this.drivers = this.drivers.filter(driverObject => driverObject !== driver);
                    break;
            }
        }
    }

    getDriversInNode(node: GraphNode): Array<Driver> {
        return this.drivers.filter(driver => driver.location === node);
    }

    // Starts or pauses the simulation
    startPauseSimulation() {
        this.runSimulation = this.runSimulation ? false : true;
        this.simulationLoop();
    }

    // The Loop
    async simulationLoop() {
        while (this.runSimulation) {
            this.driveDrivers();
            this.createDrivers();
            renderDrivers();
            await this.sleep();
        }
    }

    // Prevents the loop from crashing the browser, provided that the tick is high enough
    sleep() {
        return new Promise(resolve => setTimeout(resolve, this.tick));
    }
}

export default Simulator;
export { Driver, DriverStatus }