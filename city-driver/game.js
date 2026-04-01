// City Driver 3D - Game Logic
let scene, camera, renderer;
let vehicle, bike, playerMesh;
let city = [], traffic = [], pedestrians = [], buildings = [];
let currentMode = 'drive', currentCity = 'tokyo', isGameActive = false;
let vehicleSpeed = 0, vehicleRotation = 0;

const keys = { w: false, a: false, s: false, d: false, W: false, A: false, S: false, D: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, " ": false };
const maxSpeed = { drive: 0.8, bike: 0.5, walk: 0.1 };
const acceleration = 0.02, friction = 0.95, turnSpeed = 0.03;

const cityConfigs = {
    tokyo: { name: 'Tokyo', colors: { road: 0x333333, building: [0x4a4a6a], sky: 0x1a1a2e }, buildingHeight: [20, 80], trafficDensity: 0.3 },
    nyc: { name: 'New York', colors: { road: 0x444444, building: [0x8a8a9a], sky: 0x2a3a4a }, buildingHeight: [30, 120], trafficDensity: 0.5 },
    london: { name: 'London', colors: { road: 0x3a3a4a, building: [0x7a6a5a], sky: 0x3a3a4a }, buildingHeight: [15, 60], trafficDensity: 0.3 },
    paris: { name: 'Paris', colors: { road: 0x4a4a5a, building: [0x9a8a7a], sky: 0x4a5a6a }, buildingHeight: [12, 50], trafficDensity: 0.25 },
    dubai: { name: 'Dubai', colors: { road: 0x5a5a6a, building: [0x8a9aaa], sky: 0x2a3a5a }, buildingHeight: [40, 200], trafficDensity: 0.2 }
};

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 300);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(100, 200, 100);
    light.castShadow = true;
    scene.add(light);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);
    animate();
}

function startGame(cityName) {
    currentCity = cityName;
    isGameActive = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('modeSwitch').style.display = 'block';
    document.getElementById('speedometer').style.display = 'flex';
    city.forEach(obj => scene.remove(obj));
    traffic.forEach(obj => scene.remove(obj.mesh));
    pedestrians.forEach(obj => scene.remove(obj.mesh));
    buildings.forEach(obj => scene.remove(obj.mesh));
    if (vehicle) scene.remove(vehicle);
    if (bike) scene.remove(bike);
    if (playerMesh) scene.remove(playerMesh);
    city = []; traffic = []; pedestrians = []; buildings = [];
    generateCity();
    createVehicle();
    createBike();
    createPlayer();
    generateTraffic();
    generatePedestrians();
    const config = cityConfigs[currentCity];
    scene.background = new THREE.Color(config.colors.sky);
    scene.fog.color = new THREE.Color(config.colors.sky);
    setMode('drive');
}

function generateCity() {
    const config = cityConfigs[currentCity];
    const citySize = 12, blockSize = 40, roadWidth = 20;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshLambertMaterial({ color: 0x2a2a3a }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    city.push(ground);
    for (let x = -citySize; x <= citySize; x++) {
        for (let z = -citySize; z <= citySize; z++) {
            const posX = x * blockSize, posZ = z * blockSize;
            if (x % 4 === 0 || z % 4 === 0) {
                const road = new THREE.Mesh(new THREE.PlaneGeometry(x % 4 === 0 ? roadWidth : blockSize, z % 4 === 0 ? roadWidth : blockSize), new THREE.MeshLambertMaterial({ color: config.colors.road }));
                road.rotation.x = -Math.PI / 2;
                road.position.set(posX, 0.1, posZ);
                scene.add(road);
                city.push(road);
                if (x % 4 === 0 && z % 4 !== 0) {
                    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.5, blockSize), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
                    line.rotation.x = -Math.PI / 2;
                    line.position.set(posX, 0.11, posZ);
                    scene.add(line);
                    city.push(line);
                }
            } else if (Math.random() > 0.15) {
                createBuilding(posX, posZ, blockSize, roadWidth, config);
            }
        }
    }
}

function createBuilding(posX, posZ, blockSize, roadWidth, config) {
    const height = Math.random() * (config.buildingHeight[1] - config.buildingHeight[0]) + config.buildingHeight[0];
    const width = blockSize - roadWidth - 4, depth = blockSize - roadWidth - 4;
    const buildingGroup = new THREE.Group();
    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color: config.colors.building[Math.floor(Math.random() * config.colors.building.length)] }));
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    buildingGroup.add(building);
    const windowMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.3 ? 0x88ccff : 0x224466, transparent: true, opacity: 0.8 });
    for (let f = 1; f < Math.floor(height / 4); f++) {
        for (let w = 0; w < Math.floor(width / 3); w++) {
            if (Math.random() > 0.2) {
                const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2), windowMat.clone());
                win.position.set((w - Math.floor(width / 3) / 2) * 3, f * 4, depth / 2 + 0.1);
                buildingGroup.add(win);
            }
        }
    }
    buildingGroup.position.set(posX, 0, posZ);
    scene.add(buildingGroup);
    buildings.push({ mesh: buildingGroup, x: posX, z: posZ, width: width, depth: depth, height: height });
}

function createVehicle() {
    const carGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 8), new THREE.MeshLambertMaterial({ color: 0xff4444 }));
    body.position.y = 1.5;
    body.castShadow = true;
    carGroup.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1, 5), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    roof.position.set(0, 3, -0.5);
    carGroup.add(roof);
    const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    [[-2, 0.8, 2.5], [2, 0.8, 2.5], [-2, 0.8, -2.5], [2, 0.8, -2.5]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        carGroup.add(wheel);
    });
    vehicle = carGroup;
    vehicle.position.set(0, 0, 0);
    scene.add(vehicle);
}

function createBike() {
    const bikeGroup = new THREE.Group();
    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 3), new THREE.MeshLambertMaterial({ color: 0x44ff44 }));
    frame.position.y = 1;
    bikeGroup.add(frame);
    // Handlebars
    const handlebars = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    handlebars.position.set(0, 1.8, 1.2);
    bikeGroup.add(handlebars);
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    [[0, 0.6, 1.5], [0, 0.6, -1.5]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        bikeGroup.add(wheel);
    });
    bike = bikeGroup;
    bike.position.set(0, 0, 0);
    bike.visible = false;
    scene.add(bike);
}

function createPlayer() {
    const playerGroup = new THREE.Group();
    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), new THREE.MeshLambertMaterial({ color: 0x4444ff }));
    body.position.y = 1;
    playerGroup.add(body);
    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshLambertMaterial({ color: 0xffccaa }));
    head.position.y = 2.3;
    playerGroup.add(head);
    playerMesh = playerGroup;
    playerMesh.position.set(0, 0, 0);
    playerMesh.visible = false;
    scene.add(playerMesh);
}

function generateTraffic() {
    const config = cityConfigs[currentCity];
    const numCars = Math.floor(20 * config.trafficDensity);
    for (let i = 0; i < numCars; i++) {
        const carGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 6), new THREE.MeshLambertMaterial({ color: [0xff4444, 0x44ff44, 0x4444ff, 0xffff44][Math.floor(Math.random() * 4)] }));
        body.position.y = 0.6;
        carGroup.add(body);
        // Find road position
        let x = Math.floor(Math.random() * 6) * 4 * 40;
        if (Math.random() > 0.5) x = -x;
        let z = (Math.floor(Math.random() * 24) - 12) * 40;
        if (Math.random() > 0.5) {
            // Swap for vertical roads
            const temp = x; x = z; z = temp;
        }
        carGroup.position.set(x, 0, z);
        carGroup.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
        scene.add(carGroup);
        traffic.push({ mesh: carGroup, speed: 0.05 + Math.random() * 0.05, direction: carGroup.rotation.y });
    }
}

function generatePedestrians() {
    const config = cityConfigs[currentCity];
    const numPeds = Math.floor(30 * config.pedestrianDensity);
    for (let i = 0; i < numPeds; i++) {
        const pedGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.4), new THREE.MeshLambertMaterial({ color: 0xffccaa }));
        body.position.y = 0.9;
        pedGroup.add(body);
        const x = (Math.random() * 800 - 400);
        const z = (Math.random() * 800 - 400);
        pedGroup.position.set(x, 0, z);
        scene.add(pedGroup);
        pedestrians.push({ mesh: pedGroup, speed: 0.02 + Math.random() * 0.02, direction: Math.random() * Math.PI * 2 });
    }
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('driveBtn').classList.remove('active');
    document.getElementById('walkBtn').classList.remove('active');
    document.getElementById('bikeBtn').classList.remove('active');
    vehicle.visible = false;
    bike.visible = false;
    playerMesh.visible = false;
    if (mode === 'drive') {
        vehicle.visible = true;
        document.getElementById('driveBtn').classList.add('active');
    } else if (mode === 'bike') {
        bike.visible = true;
        document.getElementById('bikeBtn').classList.add('active');
    } else if (mode === 'walk') {
        playerMesh.visible = true;
        document.getElementById('walkBtn').classList.add('active');
    }
}

function checkBuildingCollision(newX, newZ, width, depth) {
    for (const building of buildings) {
        const bx = building.x, bz = building.z;
        const bw = building.width / 2 + width / 2 + 0.5;
        const bd = building.depth / 2 + depth / 2 + 0.5;
        if (Math.abs(newX - bx) < bw && Math.abs(newZ - bz) < bd) {
            return true;
        }
    }
    return false;
}

function updateVehicle() {
    if (!isGameActive) return;
    const currentMaxSpeed = maxSpeed[currentMode];
    let activeMesh = currentMode === 'drive' ? vehicle : currentMode === 'bike' ? bike : playerMesh;
    if (!activeMesh) return;
    
    // Acceleration - check both lowercase and uppercase
    if (keys.w || keys.W || keys.ArrowUp) vehicleSpeed += acceleration;
    else if (keys.s || keys.S || keys.ArrowDown) vehicleSpeed -= acceleration;
    
    // Friction
    vehicleSpeed *= friction;
    
    // Cap speed
    if (vehicleSpeed > currentMaxSpeed) vehicleSpeed = currentMaxSpeed;
    if (vehicleSpeed < -currentMaxSpeed / 2) vehicleSpeed = -currentMaxSpeed / 2;
    if (Math.abs(vehicleSpeed) < 0.001) vehicleSpeed = 0;
    
    // Turning - check both lowercase and uppercase
    if (Math.abs(vehicleSpeed) > 0.01) {
        if (keys.a || keys.A || keys.ArrowLeft) vehicleRotation += turnSpeed * (vehicleSpeed > 0 ? 1 : -1);
        if (keys.d || keys.D || keys.ArrowRight) vehicleRotation -= turnSpeed * (vehicleSpeed > 0 ? 1 : -1);
    }
    
    // Calculate new position
    const newX = activeMesh.position.x + Math.sin(vehicleRotation) * vehicleSpeed;
    const newZ = activeMesh.position.z + Math.cos(vehicleRotation) * vehicleSpeed;
    
    // Check collision with buildings
    const width = currentMode === 'drive' ? 4 : currentMode === 'bike' ? 1 : 0.8;
    const depth = currentMode === 'drive' ? 8 : currentMode === 'bike' ? 3 : 0.5;
    
    if (!checkBuildingCollision(newX, activeMesh.position.z, width, depth)) {
        activeMesh.position.x = newX;
    }
    if (!checkBuildingCollision(activeMesh.position.x, newZ, width, depth)) {
        activeMesh.position.z = newZ;
    }
    
    activeMesh.rotation.y = vehicleRotation;
    
    // Update speedometer
    document.getElementById('speed').textContent = Math.abs(Math.round(vehicleSpeed * 100));
}

function updateCamera() {
    if (!isGameActive) return;
    let activeMesh = currentMode === 'drive' ? vehicle : currentMode === 'bike' ? bike : playerMesh;
    if (!activeMesh) return;
    
    if (cameraMode === 'follow') {
        const offsetX = Math.sin(vehicleRotation) * cameraOffset.z;
        const offsetZ = Math.cos(vehicleRotation) * cameraOffset.z;
        camera.position.x = activeMesh.position.x - offsetX;
        camera.position.y = activeMesh.position.y + cameraOffset.y;
        camera.position.z = activeMesh.position.z - offsetZ;
        camera.lookAt(activeMesh.position);
    } else if (cameraMode === 'top') {
        camera.position.set(activeMesh.position.x, activeMesh.position.y + 100, activeMesh.position.z);
        camera.lookAt(activeMesh.position);
    }
}

function updateTraffic() {
    traffic.forEach(car => {
        car.mesh.position.x += Math.sin(car.direction) * car.speed;
        car.mesh.position.z += Math.cos(car.direction) * car.speed;
        // Wrap around
        if (car.mesh.position.x > 500) car.mesh.position.x = -500;
        if (car.mesh.position.x < -500) car.mesh.position.x = 500;
        if (car.mesh.position.z > 500) car.mesh.position.z = -500;
        if (car.mesh.position.z < -500) car.mesh.position.z = 500;
    });
}

function updatePedestrians() {
    pedestrians.forEach(ped => {
        ped.mesh.position.x += Math.sin(ped.direction) * ped.speed;
        ped.mesh.position.z += Math.cos(ped.direction) * ped.speed;
        if (Math.random() < 0.01) ped.direction += (Math.random() - 0.5) * 0.5;
        // Wrap around
        if (ped.mesh.position.x > 500) ped.mesh.position.x = -500;
        if (ped.mesh.position.x < -500) ped.mesh.position.x = 500;
        if (ped.mesh.position.z > 500) ped.mesh.position.z = -500;
        if (ped.mesh.position.z < -500) ped.mesh.position.z = 500;
    });
}

function changeCamera() {
    if (cameraMode === 'follow') cameraMode = 'top';
    else cameraMode = 'follow';
}

function resetPosition() {
    vehicleSpeed = 0;
    vehicleRotation = 0;
    if (vehicle) vehicle.position.set(0, 0, 0);
    if (bike) bike.position.set(0, 0, 0);
    if (playerMesh) playerMesh.position.set(0, 0, 0);
    if (vehicle) vehicle.rotation.y = 0;
    if (bike) bike.rotation.y = 0;
    if (playerMesh) playerMesh.rotation.y = 0;
}

function onKeyDown(e) {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    
    // Mode switching
    if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setMode('bike');
    }
    if (e.key === ' ') {
        e.preventDefault();
        setMode('walk');
    }
    if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setMode('drive');
    }
    
    if (e.key === 'r' || e.key === 'R') resetPosition();
    if (e.key === 'c' || e.key === 'C') changeCamera();
    if (e.key === 'Escape') {
        document.getElementById('menu').style.display = 'block';
        isGameActive = false;
    }
}

function onKeyUp(e) {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
}

// Camera variables
let cameraMode = 'follow';
let cameraOffset = { x: 0, y: 15, z: 30 };

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (isGameActive) {
        updateVehicle();
        updateCamera();
        updateTraffic();
        updatePedestrians();
    }
    renderer.render(scene, camera);
}

window.onload = init;
