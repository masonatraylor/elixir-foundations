// --- Setup Three.js Scene (Isometric/Orthographic) ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    -50, 1000
);

// Isometric angle
camera.position.set(20, 20, 20);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -15;
dirLight.shadow.camera.right = 15;
dirLight.shadow.camera.top = 15;
dirLight.shadow.camera.bottom = -15;
scene.add(dirLight);

// --- Environment ---
// Ground plane (Grid)
const groundGeo = new THREE.PlaneGeometry(30, 30);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x8fc866, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(30, 30, 0x000000, 0x000000);
grid.material.opacity = 0.1;
grid.material.transparent = true;
scene.add(grid);

// --- Entities ---
const entities = [];
const messages = [];

function createBuilding(x, z, color, width, height, depth, name) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    // Bevel effect by using standard material with slight roughness
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    const entity = { mesh, x, z, name, color, height, status: 'alive' };
    entities.push(entity);
    return entity;
}

// Map Layout (Rollercoaster Tycoon Isometric Vibe)
// Supervisor (Big Purple Block)
const supervisor = createBuilding(-5, -5, 0x4e2a8e, 3, 5, 3, 'Supervisor');

// GenServer (Blue Block)
const genserver = createBuilding(4, -3, 0x3498db, 2.5, 3, 2.5, 'GenServer');

// Workers (Orange Blocks)
const workers = [
    createBuilding(-6, 6, 0xf39c12, 1.5, 1.5, 1.5, 'Worker 1'),
    createBuilding(0, 6, 0xf39c12, 1.5, 1.5, 1.5, 'Worker 2'),
    createBuilding(6, 6, 0xf39c12, 1.5, 1.5, 1.5, 'Worker 3')
];

// Draw paths between them (optional visual flare)
const pathMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
function drawPath(e1, e2) {
    const points = [];
    points.push(new THREE.Vector3(e1.x, 0.1, e1.z));
    points.push(new THREE.Vector3(e2.x, 0.1, e2.z));
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, pathMat);
    scene.add(line);
}
workers.forEach(w => {
    drawPath(w, genserver);
    drawPath(supervisor, w);
});
drawPath(supervisor, genserver);

// --- Simulation Logic ---
let isPaused = false;

function spawnMessage(fromEntity, toEntity, type) {
    if (isPaused) return;

    const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const color = type === 'restart' ? 0x2ecc71 : 0xe74c3c;
    const mat = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    
    mesh.position.copy(fromEntity.mesh.position);
    mesh.position.y += fromEntity.height / 2 + 0.5;
    scene.add(mesh);
    
    messages.push({
        mesh,
        from: fromEntity,
        to: toEntity,
        progress: 0,
        type: type,
        speed: 0.01 + Math.random() * 0.01 // vary speed slightly
    });
}

function onMessageArrived(msg) {
    scene.remove(msg.mesh);
    
    if (msg.to.name === 'GenServer') {
        // Pulsate GenServer to show state update
        new TWEEN.Tween(msg.to.mesh.scale)
            .to({ x: 1.2, y: 1.2, z: 1.2 }, 150)
            .yoyo(true)
            .repeat(1)
            .start();
    }
    
    if (msg.to.name.startsWith('Worker') && msg.type === 'restart') {
        msg.to.status = 'alive';
        new TWEEN.Tween(msg.to.mesh.scale)
            .to({ x: 1, y: 1, z: 1 }, 600)
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
    }
}

function tryCrashWorker() {
    if (isPaused) return;
    
    const aliveWorkers = workers.filter(w => w.status === 'alive');
    if (aliveWorkers.length > 0 && Math.random() < 0.4) {
        const worker = aliveWorkers[Math.floor(Math.random() * aliveWorkers.length)];
        worker.status = 'dead';
        
        // Crash animation (shrink to nothing)
        new TWEEN.Tween(worker.mesh.scale)
            .to({ x: 0.01, y: 0.01, z: 0.01 }, 200)
            .start();
            
        // Supervisor detects it and sends a restart message
        setTimeout(() => {
            if (!isPaused) spawnMessage(supervisor, worker, 'restart');
        }, 800);
    }
}

function trySendMessages() {
    if (isPaused) return;
    
    workers.forEach(w => {
        if (w.status === 'alive' && Math.random() < 0.15) {
            spawnMessage(w, genserver, 'normal');
        }
    });
    
    if (Math.random() < 0.25) {
        const aliveWorkers = workers.filter(w => w.status === 'alive');
        if (aliveWorkers.length > 0) {
            const target = aliveWorkers[Math.floor(Math.random() * aliveWorkers.length)];
            spawnMessage(genserver, target, 'normal');
        }
    }
}

// Timers for the simulation events
setInterval(tryCrashWorker, 2500);
setInterval(trySendMessages, 500);

// --- Main Loop ---
function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    
    if (!isPaused) {
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            msg.progress += msg.speed;
            
            if (msg.progress >= 1) {
                onMessageArrived(msg);
                messages.splice(i, 1);
            } else {
                // Parabolic arc interpolation
                const startX = msg.from.mesh.position.x;
                const startZ = msg.from.mesh.position.z;
                const endX = msg.to.mesh.position.x;
                const endZ = msg.to.mesh.position.z;
                
                const curX = startX + (endX - startX) * msg.progress;
                const curZ = startZ + (endZ - startZ) * msg.progress;
                
                // Jump height
                const arcHeight = Math.sin(msg.progress * Math.PI) * 4;
                const startY = msg.from.mesh.position.y + msg.from.height/2;
                const endY = msg.to.mesh.position.y + msg.to.height/2;
                const baseCurY = startY + (endY - startY) * msg.progress;
                
                msg.mesh.position.set(curX, baseCurY + arcHeight, curZ);
                msg.mesh.rotation.x += 0.1;
                msg.mesh.rotation.y += 0.1;
            }
        }
    }
    
    renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// --- Window Resize ---
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- UI Controls ---
const toggleBtn = document.getElementById('toggle-sim-btn');
toggleBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        toggleBtn.textContent = 'Play Simulation';
        toggleBtn.classList.add('paused');
    } else {
        toggleBtn.textContent = 'Pause Simulation';
        toggleBtn.classList.remove('paused');
    }
});
