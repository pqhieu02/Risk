const shouldIdle = false;

//general
const WIDTH = 2000;
const HEIGHT = 1000;

// continent generator
const PERLIN_NOISE_INC = 0.005;
const WATER_THRESHOLD = 100;
const ELEVATION = 255;

// pixel identity
const WATER = -4;
const UNASSINGED_LAND = -3;
const OBSERVATION = -2;
const CLUSTER_POINT = -1;

// K-means clustering
const DEFAULT_OBSERVATIONS = 500000;
// const DEFAULT_OBSERVATIONS = 50000;
const DEFAULT_CLUSTERS = 120;
const DEFAULT_OBSERVATION_RADIUS = 10;
const MAX_POINT_RADIUS = 5;
const MIN_POINT_RADIUS = 3;

//post-processing
const ZONE_AREA_THRESHOLD = 2000;

class ColorRGB {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static red() {
        return new ColorRGB(255, 0, 0);
    }

    static blue() {
        return new ColorRGB(0, 0, 255);
    }

    static black() {
        return new ColorRGB(0, 0, 0);
    }

    static white() {
        return new ColorRGB(255, 255, 255);
    }

    static gray() {
        return new ColorRGB(100, 100, 100);
    }

    static water() {
        return new ColorRGB(116, 204, 244);
    }
    static random() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return new ColorRGB(r, g, b);
    }

    static getZoneColorList() {
        let colors = [];
        for (let i = 0; i < DEFAULT_CLUSTERS; i++) {
            let color = this.random();
            colors.push(color);
        }
        return colors;
    }
}

var allPointsX = [];
var allPointsY = [];
var allClusterX = [];
var allClusterY = [];
var zoneColors = ColorRGB.getZoneColorList();

var world;

function calculateDistance(x, y, x1, y1) {
    const deltaX = x1 - x;
    const deltaY = y1 - y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + 1e-5;
    return distance;
}

function getWorldIndex(x, y, width = WIDTH) {
    return y * width + x;
}

function isWithInWorld(x, y, width = WIDTH, height = HEIGHT) {
    if (x < 0 || y < 0) return false;
    if (x >= width || y >= height) return false;
    return true;
}

function KmeansClustering(
    world,
    clusters = DEFAULT_CLUSTERS,
    observations = DEFAULT_OBSERVATIONS
) {
    let start = performance.now();
    let observationsX = [];
    let observationsY = [];
    let clustersX = [];
    let clustersY = [];
    let clustersColor = [];
    for (let i = 0; i < observations; i++) {
        let isSet = false;
        while (isSet === false) {
            let [x, y] = [
                Math.round(random(WIDTH)),
                Math.round(random(HEIGHT)),
            ];
            let index = y * WIDTH + x;
            if (world[index] == UNASSINGED_LAND) {
                observationsX.push(x);
                observationsY.push(y);
                allPointsX.push(x);
                allPointsY.push(y);
                world[index] = OBSERVATION;
                isSet = true;
            }
        }
    }
    let zoneCount = 0;
    for (let i = 0; i < clusters; i++) {
        let isSet = false;
        while (isSet === false) {
            let [x, y] = [
                Math.round(random(WIDTH)),
                Math.round(random(HEIGHT)),
            ];
            let index = y * WIDTH + x;
            if (world[index] == UNASSINGED_LAND) {
                clustersX.push(x);
                clustersY.push(y);
                allClusterX.push(x);
                allClusterY.push(y);
                allPointsX.push(x);
                allPointsY.push(y);
                clustersColor.push(ColorRGB.random());
                world[index] = zoneCount++;
                isSet = true;
            }
        }
    }
    for (let i = 0; i < observations; i++) {
        let obsX = observationsX[i];
        let obsY = observationsY[i];
        let closetClusterDistance = 99999,
            closetClusterIndex;
        for (let j = 0; j < clusters; j++) {
            let clusterX = clustersX[j];
            let clusterY = clustersY[j];
            let distance = calculateDistance(obsX, obsY, clusterX, clusterY);
            if (distance < closetClusterDistance) {
                closetClusterIndex = j;
                closetClusterDistance = distance;
            }
        }
        let index = obsY * WIDTH + obsX;
        world[index] = closetClusterIndex;
    }
    console.log("KmeansClustering", performance.now() - start);
}

function splashClusterIntoPixels(world) {
    let start = performance.now();
    for (let i = 0; i < allPointsX.length; i++) {
        const centerX = allPointsX[i];
        const centerY = allPointsY[i];
        const centerIndex = getWorldIndex(centerX, centerY);
        const radius = Math.round(
            Math.random() * (MAX_POINT_RADIUS - MIN_POINT_RADIUS) +
                MIN_POINT_RADIUS
        );
        for (let y = centerY - radius; y < centerY + radius; y++) {
            for (let x = centerX - radius; x < centerX + radius; x++) {
                const distance = Math.sqrt(
                    (x - centerX) ** 2 + (y - centerY) ** 2
                );
                const index = y * WIDTH + x;
                if (world[index] === WATER) continue;
                if (distance <= radius) {
                    world[index] = world[centerIndex];
                }
            }
        }
    }
    console.log("splashClusterIntoPixels", performance.now() - start);
}

function postProcessingWorld(world) {
    let start = performance.now();
    const checkNeighborPixels = (x, y) => {
        let neighbors = [];
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                if ((i === 0 && j === 0) || !isWithInWorld(x + i, y + j))
                    continue;
                neighbors.push({
                    x: x + i,
                    y: y + j,
                });
            }
        return neighbors;
    };
    let isVisited = new Array(WIDTH * HEIGHT).fill(false);
    for (let i = 0; i < WIDTH; i++)
        for (let j = 0; j < HEIGHT; j++) {
            let totalPixel = 0;
            let miniZonePixel = [];
            let index = getWorldIndex(i, j, WIDTH);
            let zonePixels = new Array();
            if (isVisited[index]) continue;

            zonePixels.push({
                x: i,
                y: j,
            });
            while (zonePixels.length > 0) {
                let pos = zonePixels.pop();
                let [x, y] = [pos.x, pos.y];
                let index = getWorldIndex(x, y);

                if (isVisited[index]) continue;
                miniZonePixel.push(pos);
                totalPixel++;
                isVisited[index] = true;
                let neighbors = checkNeighborPixels(pos.x, pos.y);
                // console.log("neighbors ", neighbors);
                neighbors.forEach((pos) => {
                    let neighborIndex = getWorldIndex(pos.x, pos.y);
                    let zone = world[neighborIndex];
                    if (
                        isVisited[neighborIndex] === true ||
                        zone !== world[index]
                    )
                        return;
                    zonePixels.push(pos);
                });
            }
            if (totalPixel < ZONE_AREA_THRESHOLD) {
                miniZonePixel.forEach((pos) => {
                    let [x, y] = [pos.x, pos.y];
                    let index = getWorldIndex(x, y);
                    world[index] = OBSERVATION;
                });
            }
        }
    console.log("postProcessingWorld", performance.now() - start);
}

function setup() {
    let start = performance.now();
    createCanvas(WIDTH, HEIGHT);
    world = new Int8Array(WIDTH * HEIGHT);
    if (shouldIdle) return;
    var xoff = 0;
    for (let i = 0; i < WIDTH; i++) {
        var yoff = 0;
        for (let j = 0; j < HEIGHT; j++) {
            let index = j * WIDTH + i;
            world[index] =
                noise(xoff, yoff) * ELEVATION > WATER_THRESHOLD
                    ? UNASSINGED_LAND
                    : WATER;
            yoff += PERLIN_NOISE_INC;
        }
        xoff += PERLIN_NOISE_INC;
    }
    KmeansClustering(world);
    splashClusterIntoPixels(world);
    // postProcessingWorld(world);
    console.log("------setup------");
    console.log(performance.now() - start);
}

function isWithinMap(x, y) {
    if (x < 0 || y < 0) return false;
    if (x >= WIDTH || y >= HEIGHT) return false;
    return true;
}

function coloringPixel(world, x, y) {
    let color;
    let pixel = world[y * WIDTH + x];
    let isZoneBorder = false;

    switch (pixel) {
        case WATER:
            color = ColorRGB.water();
            break;
        case UNASSINGED_LAND:
            color = ColorRGB.gray();
            break;
        case OBSERVATION:
            color = ColorRGB.red();
            break;
        default:
            color = zoneColors[world[y * WIDTH + x]];
            // color = ColorRGB.red();
            // color = ColorRGB.white();
            break;
    }
    if (pixel === WATER) return color;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            let [neighborX, neighborY] = [x + i, y + j];
            if (!isWithinMap(neighborX, neighborY)) {
                continue;
            }
            let neighborIndex = neighborY * WIDTH + neighborX;
            if (world[neighborIndex] != pixel) {
                isZoneBorder = true;
            }
        }
    }
    // if (isZoneBorder) color = ColorRGB.black();
    return color;
}

function draw() {
    // let start = performance.now();
    let img = createImage(WIDTH, HEIGHT);
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            let index = (j * img.width + i) * 4;
            let c = coloringPixel(world, i, j);
            img.pixels[index] = c.r;
            img.pixels[index + 1] = c.g;
            img.pixels[index + 2] = c.b;
            img.pixels[index + 3] = 255;
        }
    }
    noLoop();
    img.updatePixels();
    image(img, 0, 0);
    // console.log("draw-----");
    // console.log(performance.now() - start);
    // console.log("------");
}
