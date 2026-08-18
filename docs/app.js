// --- Setup Three.js Scene (Isometric/Orthographic) ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x74b9ff); // Sky blue
scene.fog = new THREE.Fog(0x74b9ff, 10, 50);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 25;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    -50, 1000
);

camera.position.set(20, 20, 20);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(15, 25, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

const matGrass = new THREE.MeshStandardMaterial({ color: 0x55efc4, roughness: 0.9, flatShading: true });
const matDirt = new THREE.MeshStandardMaterial({ color: 0xe1b12c, roughness: 1, flatShading: true });
const matWood = new THREE.MeshStandardMaterial({ color: 0x834c24, roughness: 0.9, flatShading: true });
const matLeaves = new THREE.MeshStandardMaterial({ color: 0x00b894, roughness: 0.8, flatShading: true });
const matConcrete = new THREE.MeshStandardMaterial({ color: 0xb2bec3, roughness: 0.7, flatShading: true });
const matSupervisor = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.5, flatShading: true });
const matWorker = new THREE.MeshStandardMaterial({ color: 0xfdcb6e, roughness: 0.5, flatShading: true });
const matRoof = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6, flatShading: true });
const matGlass = new THREE.MeshStandardMaterial({ color: 0x0984e3, transparent: true, opacity: 0.7, roughness: 0.1 });

// Island
const island = new THREE.Group();
const groundGeo = new THREE.BoxGeometry(22, 2, 22);
const ground = new THREE.Mesh(groundGeo, matGrass);
ground.position.y = -1;
ground.receiveShadow = true;
island.add(ground);

const dirtGeo = new THREE.BoxGeometry(20, 3, 20);
const dirt = new THREE.Mesh(dirtGeo, matDirt);
dirt.position.y = -2.5;
island.add(dirt);
scene.add(island);

const entities = [];
const labels = [];
const messages = [];

// OTP Telemetry System
const logContainer = document.getElementById('telemetry-logs');

function logTelemetry(htmlContent) {
    if (!logContainer) return;
    const div = document.createElement('div');
    div.className = 'log-entry';
    const time = new Date().toISOString().split('T')[1].substring(0, 8);
    div.innerHTML = `<span class="log-time">[${time}]</span> ${htmlContent}`;
    logContainer.appendChild(div);
    // Auto scroll
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Keep log clean
    if (logContainer.childNodes.length > 50) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

function genPid() {
    return '#PID<0.' + Math.floor(Math.random() * 200 + 100) + '.0>';
}

function createLabel(name, pid, x, y, z, isGenServer = false) {
    const div = document.createElement('div');
    div.className = 'floating-label';
    let html = `${name}<br><span class="pid">${pid}</span>`;
    if (isGenServer) {
        html += `<br><span class="state" id="gs-state">State: 0</span>`;
    }
    div.innerHTML = html;
    document.body.appendChild(div);
    const labelObj = { div, x, y, z };
    labels.push(labelObj);
    return labelObj;
}

// Scenery
function createTree(x, z) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1, 5), matWood);
    trunk.position.y = 0.5;
    trunk.castShadow = true;
    tree.add(trunk);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 5), matLeaves);
    leaves.position.y = 1.8;
    leaves.castShadow = true;
    tree.add(leaves);
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI;
    const scale = 0.8 + Math.random() * 0.4;
    tree.scale.set(scale, scale, scale);
    scene.add(tree);
}
[[-9, -9], [-8, 9], [9, -8], [8, 9], [-9, 0], [9, 0], [0, 9], [-5, 8], [5, -9]].forEach(pos => createTree(pos[0], pos[1]));

function createSupervisor(x, z) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 1, 6), matConcrete);
    base.position.y = 0.5;
    base.castShadow = true;
    group.add(base);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.5, 4, 6), matSupervisor);
    tower.position.y = 3;
    tower.castShadow = true;
    group.add(tower);
    const controlRoom = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.2, 1.5, 6), matConcrete);
    controlRoom.position.y = 5.5;
    controlRoom.castShadow = true;
    group.add(controlRoom);
    
    const radarGeo = new THREE.Group();
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), matConcrete);
    dish.rotation.x = -Math.PI / 3;
    dish.position.y = 0.5;
    radarGeo.add(dish);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), matWood);
    antenna.position.set(0, 0.5, 0.5);
    antenna.rotation.x = Math.PI / 3;
    radarGeo.add(antenna);
    radarGeo.position.y = 6.25;
    group.add(radarGeo);
    
    group.position.set(x, 0, z);
    scene.add(group);
    
    const pid = '#PID<0.0.0>'; // init process
    const label = createLabel('Supervisor', pid, x, 8, z);
    logTelemetry(`<span class="log-info">[Supervisor] Application started. Root PID: ${pid}</span>`);
    return { mesh: group, name: 'Supervisor', pid, radar: radarGeo, height: 6, x, z, label };
}

function createGenServer(x, z) {
    const group = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), matConcrete);
    pad.position.y = 0.25;
    group.add(pad);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 8), matConcrete);
    base.position.y = 0.75;
    group.add(base);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 8), matGlass);
    core.position.y = 2.25;
    group.add(core);
    
    const stateCore = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({color: 0x74b9ff}));
    stateCore.position.y = 2.25;
    group.add(stateCore);
    
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 8), matConcrete);
    top.position.y = 3.75;
    group.add(top);
    
    group.position.set(x, 0, z);
    scene.add(group);
    
    const pid = genPid();
    const label = createLabel('GenServer', pid, x, 5.5, z, true);
    logTelemetry(`<span class="log-info">[Supervisor] Started child GenServer ${pid}</span>`);
    return { mesh: group, stateCore: stateCore, name: 'GenServer', pid, stateValue: 0, height: 4, x, z, label };
}

function createWorker(x, z, name) {
    const group = new THREE.Group();
    const building = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.8), matWorker);
    building.position.y = 0.75;
    building.castShadow = true;
    group.add(building);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 4), matRoof);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.1;
    roof.castShadow = true;
    group.add(roof);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), matConcrete);
    stack.position.set(0.5, 2.5, -0.5);
    group.add(stack);
    
    group.position.set(x, 0, z);
    scene.add(group);
    
    const pid = genPid();
    const label = createLabel(name, pid, x, 4, z);
    logTelemetry(`<span class="log-info">[Supervisor] Started child ${name} ${pid}</span>`);
    const worker = { mesh: group, name: name, pid: pid, status: 'alive', height: 3, x, z, label, originalY: group.position.y };
    entities.push(worker);
    return worker;
}

function createPath(x, z, width, depth) {
    const path = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), matDirt);
    path.position.set(x, 0.05, z);
    scene.add(path);
}
createPath(-4, 0, 2, 12);
createPath(0, 4, 10, 2);
createPath(4, 0, 2, 10);
createPath(0, -4, 10, 2);

const supervisorEntity = createSupervisor(-4, -6);
const genserverEntity = createGenServer(4, -4);
const workers = [
    createWorker(-6, 4, 'Worker 1'),
    createWorker(0, 4, 'Worker 2'),
    createWorker(6, 4, 'Worker 3')
];

let isPaused = false;

function spawnMessage(fromEntity, toEntity, type) {
    if (isPaused) return;

    const geo = new THREE.BoxGeometry(0.5, 0.3, 0.6);
    const color = type === 'restart' ? 0x00b894 : 0xd63031;
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    
    mesh.position.copy(fromEntity.mesh.position);
    mesh.position.y += fromEntity.height - 1;
    scene.add(mesh);
    
    if (type === 'normal' && fromEntity.name.startsWith('Worker')) {
        logTelemetry(`<span class="log-pid">${fromEntity.pid}</span> cast message -> <span class="log-pid">${toEntity.pid}</span>`);
    } else if (type === 'restart') {
        logTelemetry(`<span class="log-success">[Supervisor] Dispatching restart to ${toEntity.name}</span>`);
    }
    
    messages.push({
        mesh, from: fromEntity, to: toEntity, progress: 0, type: type,
        speed: 0.015 + Math.random() * 0.005
    });
}

function onMessageArrived(msg) {
    scene.remove(msg.mesh);
    
    if (msg.to.name === 'GenServer') {
        msg.to.stateValue += 1;
        document.getElementById('gs-state').textContent = `State: ${msg.to.stateValue}`;
        logTelemetry(`<span class="log-info">[GenServer] handle_cast/2 -> New State: ${msg.to.stateValue}</span>`);
        
        new TWEEN.Tween(msg.to.stateCore.scale)
            .to({ x: 1.5, y: 1.5, z: 1.5 }, 100).yoyo(true).repeat(1).start();
        msg.to.stateCore.material.color.setHex(0xffffff);
        setTimeout(() => msg.to.stateCore.material.color.setHex(0x74b9ff), 200);
    }
    
    if (msg.to.name.startsWith('Worker') && msg.type === 'restart') {
        msg.to.status = 'alive';
        msg.to.pid = genPid(); // New PID after restart
        msg.to.label.div.innerHTML = `${msg.to.name}<br><span class="pid">${msg.to.pid}</span>`;
        msg.to.label.div.classList.remove('dead');
        
        logTelemetry(`<span class="log-success">[Supervisor] Restarted ${msg.to.name} successfully (New PID: ${msg.to.pid})</span>`);
        
        new TWEEN.Tween(msg.to.mesh.scale).to({ x: 1, y: 1, z: 1 }, 800).easing(TWEEN.Easing.Elastic.Out).start();
        new TWEEN.Tween(msg.to.mesh.position).to({ y: msg.to.originalY }, 300).easing(TWEEN.Easing.Quadratic.Out).start();
    }
}

function tryCrashWorker() {
    if (isPaused) return;
    const aliveWorkers = workers.filter(w => w.status === 'alive');
    if (aliveWorkers.length > 0 && Math.random() < 0.4) {
        const worker = aliveWorkers[Math.floor(Math.random() * aliveWorkers.length)];
        worker.status = 'dead';
        worker.label.div.innerHTML = `CRASHED<br><span class="pid">${worker.pid}</span>`;
        worker.label.div.classList.add('dead');
        
        logTelemetry(`<span class="log-error">[Error] Process ${worker.pid} (${worker.name}) exited abnormally: :kill</span>`);
        
        new TWEEN.Tween(worker.mesh.scale).to({ x: 1.3, y: 0.1, z: 1.3 }, 200).easing(TWEEN.Easing.Quadratic.Out).start();
        new TWEEN.Tween(worker.mesh.position).to({ y: worker.originalY - 0.6 }, 200).easing(TWEEN.Easing.Quadratic.Out).start();
            
        setTimeout(() => {
            if (!isPaused) spawnMessage(supervisorEntity, worker, 'restart');
        }, 1200);
    }
}

function trySendMessages() {
    if (isPaused) return;
    workers.forEach(w => {
        if (w.status === 'alive' && Math.random() < 0.15) {
            spawnMessage(w, genserverEntity, 'normal');
        }
    });
}

setInterval(tryCrashWorker, 4000);
setInterval(trySendMessages, 1000);

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    
    if (!isPaused) {
        supervisorEntity.radar.rotation.y += 0.05;
        const pulse = 1 + Math.sin(time * 0.003) * 0.1;
        genserverEntity.stateCore.scale.set(pulse, pulse, pulse);
        
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            msg.progress += msg.speed;
            
            if (msg.progress >= 1) {
                onMessageArrived(msg);
                messages.splice(i, 1);
            } else {
                const startX = msg.from.x; const startZ = msg.from.z;
                const endX = msg.to.x; const endZ = msg.to.z;
                const curX = startX + (endX - startX) * msg.progress;
                const curZ = startZ + (endZ - startZ) * msg.progress;
                
                const arcHeight = Math.sin(msg.progress * Math.PI) * 4;
                const startY = msg.from.height;
                const endY = msg.to.height;
                const baseCurY = startY + (endY - startY) * msg.progress;
                
                msg.mesh.position.set(curX, baseCurY + arcHeight, curZ);
                msg.mesh.rotation.x += 0.1; msg.mesh.rotation.y += 0.15;
            }
        }
    }
    
    labels.forEach(l => {
        const vec = new THREE.Vector3(l.x, l.y, l.z);
        vec.project(camera);
        const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vec.y * -0.5 + 0.5) * window.innerHeight;
        
        if (vec.z > 1) {
            l.div.style.opacity = '0';
        } else {
            l.div.style.opacity = '1';
            l.div.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        }
    });
    
    renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const toggleBtn = document.getElementById('toggle-sim-btn');
toggleBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        toggleBtn.textContent = 'Play Simulation';
        toggleBtn.classList.add('paused');
        logTelemetry(`<span class="log-warn">[System] Simulation Paused.</span>`);
    } else {
        toggleBtn.textContent = 'Pause Simulation';
        toggleBtn.classList.remove('paused');
        logTelemetry(`<span class="log-info">[System] Simulation Resumed.</span>`);
    }
});
