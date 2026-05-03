const THREE_URLS = [
  "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "https://unpkg.com/three@0.160.0/build/three.module.js",
];

const canvas = document.querySelector("#physicsCanvas");
const loadout = document.querySelector("#loadout");
const playPause = document.querySelector("#playPause");
const playPauseIcon = document.querySelector("#playPauseIcon");
const singleStep = document.querySelector("#singleStep");
const toggleControlsButton = document.querySelector("#toggleControls");
const toggleControlsLabel = document.querySelector("#toggleControlsLabel");
const controlDock = document.querySelector("#controlDock");
const resetCameraButton = document.querySelector("#resetCamera");
const resetScene = document.querySelector("#resetScene");
const toggleDebugButton = document.querySelector("#toggleDebug");
const clearScene = document.querySelector("#clearScene");
const dropCubeButton = document.querySelector("#dropCube");
const cubeStormButton = document.querySelector("#cubeStorm");
const buildTowerButton = document.querySelector("#buildTower");
const shockwaveButton = document.querySelector("#shockwave");
const spawnRainButton = document.querySelector("#spawnRain");
const shuffleSceneButton = document.querySelector("#shuffleScene");
const cubeMaterial = document.querySelector("#cubeMaterial");
const cubeSize = document.querySelector("#cubeSize");
const sizeOutput = document.querySelector("#sizeOutput");
const chaosLevel = document.querySelector("#chaosLevel");
const chaosOutput = document.querySelector("#chaosOutput");
const gravityControls = document.querySelector("#gravityControls");
const speedControls = document.querySelector("#speedControls");
const autoDrop = document.querySelector("#autoDrop");
const trailMode = document.querySelector("#trailMode");
const cubeCount = document.querySelector("#cubeCount");
const energyReadout = document.querySelector("#energyReadout");
const fpsReadout = document.querySelector("#fpsReadout");
const gravityReadout = document.querySelector("#gravityReadout");
const speedReadout = document.querySelector("#speedReadout");
const heightReadout = document.querySelector("#heightReadout");
const hud = document.querySelector("#hud");
const debugPanel = document.querySelector("#debugPanel");
const closeDebugButton = document.querySelector("#closeDebug");
const debugBodies = document.querySelector("#debugBodies");
const debugGravity = document.querySelector("#debugGravity");
const debugSpawn = document.querySelector("#debugSpawn");
const debugCamera = document.querySelector("#debugCamera");
const maxBodies = document.querySelector("#maxBodies");
const maxBodiesOutput = document.querySelector("#maxBodiesOutput");
const trailStrength = document.querySelector("#trailStrength");
const trailStrengthOutput = document.querySelector("#trailStrengthOutput");
const debugWireframe = document.querySelector("#debugWireframe");
const debugFreezeTarget = document.querySelector("#debugFreezeTarget");
const debugShowHud = document.querySelector("#debugShowHud");
const debugSlowMo = document.querySelector("#debugSlowMo");
const debugSpawnBurst = document.querySelector("#debugSpawnBurst");
const debugPurgeTrails = document.querySelector("#debugPurgeTrails");
const debugReseed = document.querySelector("#debugReseed");
const debugSnapshot = document.querySelector("#debugSnapshot");

const MATERIALS = {
  rubber: {
    color: 0x68e07f,
    emissive: 0x092414,
    roughness: 0.52,
    metalness: 0.02,
    mass: 0.85,
    restitution: 0.82,
    friction: 0.58,
  },
  ice: {
    color: 0x7bc8ff,
    emissive: 0x081b2c,
    roughness: 0.18,
    metalness: 0.05,
    mass: 0.72,
    restitution: 0.5,
    friction: 0.08,
  },
  metal: {
    color: 0xb9bec8,
    emissive: 0x0a0b0c,
    roughness: 0.36,
    metalness: 0.82,
    mass: 2.35,
    restitution: 0.24,
    friction: 0.42,
  },
  foam: {
    color: 0xffcb63,
    emissive: 0x301c05,
    roughness: 0.74,
    metalness: 0.0,
    mass: 0.38,
    restitution: 0.68,
    friction: 0.82,
  },
};

const GRAVITY = {
  earth: { x: 0, y: -18, z: 0 },
  moon: { x: 0, y: -4.2, z: 0 },
  zero: { x: 0, y: 0, z: 0 },
  side: { x: 13, y: -5, z: 0 },
};

const world = {
  arena: 9,
  maxBodies: 170,
  bodies: [],
  playing: true,
  gravity: "earth",
  chaos: Number(chaosLevel.value),
  cubeSize: Number(cubeSize.value),
  spawnTarget: { x: 0, y: 0, z: 0 },
  lastAutoDrop: 0,
  lastRainDrop: 0,
  frameCount: 0,
  fpsStartedAt: performance.now(),
  energy: 0,
  simSpeed: 1,
  rainMode: false,
  trailsEnabled: true,
  trailOpacity: 0.04,
  trailLimit: 3,
  peakHeight: 0,
  statusTimer: 0,
  controlsOpen: false,
  debugOpen: false,
  freezeTarget: false,
  showHud: true,
  debugWireframe: false,
  debugSlowMo: false,
};

const pointer = {
  down: false,
  moved: false,
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
};

const cameraRig = {
  yaw: -0.72,
  pitch: 0.72,
  distance: 17,
  targetY: 2.2,
};

let THREE;
let renderer;
let scene;
let camera;
let raycaster;
let floor;
let marker;
let arenaGroup;
let clock;
let sharedGeometry;
let lastNow = performance.now();

async function loadThree() {
  let lastError;

  for (const url of THREE_URLS) {
    try {
      return await import(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to load Three.js");
}

function vec3(x = 0, y = 0, z = 0) {
  return new THREE.Vector3(x, y, z);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatNumber(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits)).toString();
}

function getEffectiveSimSpeed() {
  return world.simSpeed * (world.debugSlowMo ? 0.35 : 1);
}

function setStatus(text) {
  loadout.textContent = text;
  loadout.classList.remove("hidden");
  if (world.statusTimer) {
    window.clearTimeout(world.statusTimer);
    world.statusTimer = 0;
  }
}

function hideStatus() {
  loadout.classList.add("hidden");
}

function flashStatus(text, duration = 1100) {
  setStatus(text);
  world.statusTimer = window.setTimeout(() => {
    hideStatus();
    world.statusTimer = 0;
  }, duration);
}

function setControlsOpen(open) {
  world.controlsOpen = open;
  controlDock.classList.toggle("collapsed", !open);
  toggleControlsButton.classList.toggle("active", open);
  toggleControlsButton.setAttribute("aria-expanded", String(open));
  toggleControlsButton.title = open ? "Hide Controls (X)" : "Open Controls (X)";
  toggleControlsLabel.textContent = open ? "Hide Controls" : "Controls";
  document.body.classList.toggle("controls-open", open);
}

function setDebugOpen(open) {
  world.debugOpen = open;
  debugPanel.classList.toggle("hidden", !open);
  toggleDebugButton.classList.toggle("active", open);
  toggleDebugButton.setAttribute("aria-pressed", String(open));
  if (open) updateDebugPanel();
}

function setHudVisible(visible) {
  world.showHud = visible;
  hud.classList.toggle("hidden", !visible);
  debugShowHud.checked = visible;
}

function setWireframe(enabled) {
  world.debugWireframe = enabled;
  scene.traverse((object) => {
    if (!object.isMesh || object === marker) return;
    if (Array.isArray(object.material)) {
      for (const material of object.material) material.wireframe = enabled;
      return;
    }
    object.material.wireframe = enabled;
  });
}

function setMaxBodies(value) {
  world.maxBodies = value;
  maxBodies.value = String(value);
  maxBodiesOutput.textContent = String(value);
  while (world.bodies.length > world.maxBodies) {
    removeBody(world.bodies[0]);
  }
}

function setTrailOpacity(value) {
  world.trailOpacity = value;
  trailStrength.value = String(Math.round(value * 100));
  trailStrengthOutput.textContent = `${Math.round(value * 100)}%`;
  if (value <= 0) clearAllTrails();
}

function clearAllTrails() {
  for (const body of world.bodies) clearTrail(body);
}

function spawnDebugBurst() {
  for (let i = 0; i < 12; i += 1) {
    dropCube(
      world.spawnTarget.x + randomBetween(-1.8, 1.8),
      world.spawnTarget.z + randomBetween(-1.8, 1.8),
      {
        y: randomBetween(9, 16),
        size: world.cubeSize * randomBetween(0.7, 1.2),
      },
    );
  }

  flashStatus("Debug burst spawned");
}

function reseedArena() {
  resetWorld();
  cubeStorm();
  flashStatus("Arena reseeded");
}

function updateDebugPanel() {
  if (!world.debugOpen) return;

  const gravity = GRAVITY[world.gravity];
  const effectiveSpeed = getEffectiveSimSpeed();

  debugBodies.textContent = `${world.bodies.length} / ${world.maxBodies}`;
  debugGravity.textContent = `${gravity.x}, ${gravity.y}, ${gravity.z}`;
  debugSpawn.textContent = `${formatNumber(world.spawnTarget.x, 1)}, ${formatNumber(world.spawnTarget.z, 1)}`;
  debugCamera.textContent =
    `${formatNumber(cameraRig.distance, 1)} / ${formatNumber(cameraRig.yaw, 2)} / ${formatNumber(cameraRig.pitch, 2)}`;

  debugSnapshot.textContent = JSON.stringify({
    playing: world.playing,
    bodies: world.bodies.length,
    maxBodies: world.maxBodies,
    material: cubeMaterial.value,
    gravity: world.gravity,
    gravityVector: gravity,
    simSpeed: world.simSpeed,
    effectiveSpeed,
    chaos: world.chaos,
    cubeSize: world.cubeSize,
    energy: Math.round(world.energy),
    peakHeight: Number(world.peakHeight.toFixed(2)),
    spawnTarget: {
      x: Number(world.spawnTarget.x.toFixed(2)),
      z: Number(world.spawnTarget.z.toFixed(2)),
    },
    camera: {
      yaw: Number(cameraRig.yaw.toFixed(3)),
      pitch: Number(cameraRig.pitch.toFixed(3)),
      distance: Number(cameraRig.distance.toFixed(2)),
    },
    flags: {
      autoDrop: autoDrop.checked,
      rainMode: world.rainMode,
      trailsEnabled: world.trailsEnabled,
      trailOpacity: world.trailOpacity,
      wireframe: world.debugWireframe,
      freezeTarget: world.freezeTarget,
      hud: world.showHud,
      slowMo: world.debugSlowMo,
    },
  }, null, 2);
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10130f);
  scene.fog = new THREE.Fog(0x10130f, 20, 54);

  camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  raycaster = new THREE.Raycaster();
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x10130f, 1);

  sharedGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
  addLights();
  addArena();
  addMarker();
  resetWorld();
  resize();
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0xaedcff, 0x332416, 1.35);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-8, 16, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 42;
  scene.add(key);

  const rim = new THREE.PointLight(0xff7b54, 55, 34);
  rim.position.set(9, 7, -8);
  scene.add(rim);

  const cool = new THREE.PointLight(0x55a8ff, 38, 32);
  cool.position.set(-10, 5, 6);
  scene.add(cool);
}

function addArena() {
  arenaGroup = new THREE.Group();
  scene.add(arenaGroup);

  const floorGeometry = new THREE.BoxGeometry(world.arena * 2, 0.45, world.arena * 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x202820,
    roughness: 0.7,
    metalness: 0.08,
  });
  floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.23;
  floor.receiveShadow = true;
  arenaGroup.add(floor);

  const grid = new THREE.GridHelper(world.arena * 2, 18, 0x73e0bc, 0x3d554a);
  grid.position.y = 0.012;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  arenaGroup.add(grid);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x253129,
    roughness: 0.58,
    metalness: 0.12,
    transparent: true,
    opacity: 0.38,
  });

  const wallSpecs = [
    [world.arena * 2, 5, 0.4, 0, 2.5, -world.arena],
    [world.arena * 2, 5, 0.4, 0, 2.5, world.arena],
    [0.4, 5, world.arena * 2, -world.arena, 2.5, 0],
    [0.4, 5, world.arena * 2, world.arena, 2.5, 0],
  ];

  for (const spec of wallSpecs) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(spec[0], spec[1], spec[2]), wallMaterial);
    wall.position.set(spec[3], spec[4], spec[5]);
    wall.receiveShadow = true;
    arenaGroup.add(wall);
  }
}

function addMarker() {
  const ringGeometry = new THREE.TorusGeometry(0.55, 0.025, 8, 36);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x73e0bc,
    transparent: true,
    opacity: 0.78,
  });
  marker = new THREE.Mesh(ringGeometry, ringMaterial);
  marker.rotation.x = Math.PI / 2;
  marker.position.set(0, 0.04, 0);
  scene.add(marker);
}

function materialFor(type) {
  const spec = MATERIALS[type];
  return new THREE.MeshStandardMaterial({
    color: spec.color,
    emissive: spec.emissive,
    roughness: spec.roughness,
    metalness: spec.metalness,
  });
}

function createBody(type, x, y, z, size, velocity = null) {
  const spec = MATERIALS[type];
  const mesh = new THREE.Mesh(sharedGeometry, materialFor(type));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.scale.setScalar(size);
  mesh.position.set(x, y, z);
  mesh.rotation.set(randomBetween(-0.5, 0.5), randomBetween(-0.5, 0.5), randomBetween(-0.5, 0.5));
  scene.add(mesh);

  const mass = spec.mass * size * size * size;
  const body = {
    mesh,
    type,
    size,
    half: size / 2,
    mass,
    invMass: 1 / mass,
    restitution: spec.restitution,
    friction: spec.friction,
    pos: mesh.position.clone(),
    vel: velocity || vec3(randomBetween(-1.5, 1.5), randomBetween(1, 3), randomBetween(-1.5, 1.5)),
    angularVel: vec3(randomBetween(-4, 4), randomBetween(-4, 4), randomBetween(-4, 4)),
    lastTrailPos: null,
    trail: [],
  };

  if (world.bodies.length >= world.maxBodies) {
    removeBody(world.bodies[0]);
  }

  world.bodies.push(body);
  return body;
}

function removeBody(body) {
  const index = world.bodies.indexOf(body);
  if (index >= 0) world.bodies.splice(index, 1);
  scene.remove(body.mesh);
  body.mesh.material.dispose();
  clearTrail(body);
}

function clearTrail(body) {
  for (const ghost of body.trail) {
    scene.remove(ghost);
    ghost.material.dispose();
  }
  body.trail.length = 0;
  body.lastTrailPos = null;
}

function dropCube(x = world.spawnTarget.x, z = world.spawnTarget.z, options = {}) {
  const type = options.type || cubeMaterial.value;
  const size = options.size || world.cubeSize;
  const chaos = world.chaos / 10;
  const spawnY = options.y || randomBetween(7, 11);
  const velocity = vec3(
    randomBetween(-3.2, 3.2) * chaos,
    randomBetween(-1, 2.5),
    randomBetween(-3.2, 3.2) * chaos,
  );

  const body = createBody(type, x, spawnY, z, size, velocity);
  body.angularVel.multiplyScalar(1 + chaos * 2.6);
  pulseMarker(0.9 + size * 0.5);
}

function cubeStorm() {
  const count = 28 + world.chaos * 3;
  for (let i = 0; i < count; i += 1) {
    const size = world.cubeSize * randomBetween(0.65, 1.25);
    dropCube(randomBetween(-6.8, 6.8), randomBetween(-6.8, 6.8), {
      y: randomBetween(8, 20),
      size,
    });
  }

  flashStatus(`Storm dropped: ${count} cubes`);
}

function shockwave() {
  const origin = vec3(world.spawnTarget.x, 0.4, world.spawnTarget.z);
  const strength = 18 + world.chaos * 8;

  for (const body of world.bodies) {
    const direction = body.pos.clone().sub(origin);
    const distance = Math.max(direction.length(), 0.75);
    direction.normalize();
    const lift = vec3(0, randomBetween(0.8, 1.6), 0);
    const impulse = direction.add(lift).normalize().multiplyScalar(strength / distance);
    body.vel.add(impulse.multiplyScalar(body.invMass * 1.4));
    body.angularVel.add(vec3(randomBetween(-12, 12), randomBetween(-12, 12), randomBetween(-12, 12)));
  }

  addShockRing(origin);
  flashStatus("Shockwave fired");
}

function buildTower() {
  const levels = 5 + Math.round(world.chaos * 0.6);
  const spacing = world.cubeSize * 1.08;
  const wobble = Math.min(0.26, world.chaos * 0.02);

  for (let i = 0; i < levels; i += 1) {
    const offsetX = randomBetween(-wobble, wobble);
    const offsetZ = randomBetween(-wobble, wobble);
    createBody(
      cubeMaterial.value,
      world.spawnTarget.x + offsetX,
      world.cubeSize / 2 + i * spacing,
      world.spawnTarget.z + offsetZ,
      world.cubeSize,
      vec3(0, 0, 0),
    );
  }

  pulseMarker(1.2 + world.cubeSize * 0.4);
  flashStatus(`Tower built: ${levels} cubes`);
}

function toggleRain(force = !world.rainMode) {
  world.rainMode = force;
  spawnRainButton.classList.toggle("active", world.rainMode);
  spawnRainButton.setAttribute("aria-pressed", String(world.rainMode));
  flashStatus(world.rainMode ? "Rain mode on" : "Rain mode off");
}

function shuffleScene() {
  for (const body of world.bodies) {
    body.vel.set(
      randomBetween(-10, 10),
      randomBetween(1, 12),
      randomBetween(-10, 10),
    );
    body.angularVel.set(
      randomBetween(-14, 14),
      randomBetween(-14, 14),
      randomBetween(-14, 14),
    );
  }

  flashStatus("Scene shuffled");
}

function addShockRing(origin) {
  const geometry = new THREE.TorusGeometry(0.35, 0.045, 8, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff7b54,
    transparent: true,
    opacity: 0.86,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.position.set(origin.x, 0.08, origin.z);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const started = performance.now();
  const animateRing = (now) => {
    const t = Math.min((now - started) / 520, 1);
    ring.scale.setScalar(1 + t * 18);
    material.opacity = 0.86 * (1 - t);
    if (t < 1) {
      requestAnimationFrame(animateRing);
    } else {
      scene.remove(ring);
      geometry.dispose();
      material.dispose();
    }
  };
  requestAnimationFrame(animateRing);
}

function pulseMarker(scale) {
  marker.scale.setScalar(scale);
}

function resetWorld() {
  clearWorld();
  const base = [
    [-2.2, 0.5, -1.6],
    [-1.1, 0.5, -1.6],
    [0, 0.5, -1.6],
    [1.1, 0.5, -1.6],
    [2.2, 0.5, -1.6],
    [-1.6, 1.55, -1.6],
    [-0.55, 1.55, -1.6],
    [0.55, 1.55, -1.6],
    [1.6, 1.55, -1.6],
    [-1.05, 2.6, -1.6],
    [0, 2.6, -1.6],
    [1.05, 2.6, -1.6],
  ];

  for (const [x, y, z] of base) {
    createBody("rubber", x, y, z, 0.95, vec3(0, 0, 0));
  }

  for (let i = 0; i < 10; i += 1) {
    createBody("ice", randomBetween(-4, 4), randomBetween(5, 11), randomBetween(-3, 4), randomBetween(0.55, 0.9));
  }

  world.peakHeight = 0;
  flashStatus("Arena reset");
}

function clearWorld() {
  for (const body of [...world.bodies]) removeBody(body);
  world.bodies.length = 0;
  world.energy = 0;
  world.peakHeight = 0;
}

function setPlaying(playing) {
  world.playing = playing;
  playPauseIcon.textContent = playing ? "||" : ">";
  playPause.setAttribute("aria-label", playing ? "Pause simulation" : "Play simulation");
  playPause.title = playing ? "Pause" : "Play";
  playPause.classList.toggle("active", playing);
  flashStatus(playing ? "Simulation running" : "Simulation paused", 800);
}

function setGravity(name) {
  world.gravity = name;
  for (const button of gravityControls.querySelectorAll(".segment")) {
    button.classList.toggle("active", button.dataset.gravity === name);
  }
  gravityReadout.textContent = `${name} gravity`;
}

function setSpeed(speed) {
  world.simSpeed = speed;
  for (const button of speedControls.querySelectorAll(".segment")) {
    button.classList.toggle("active", Number(button.dataset.speed) === speed);
  }
  speedReadout.textContent = `${formatNumber(getEffectiveSimSpeed())}x sim`;
}

function resetCamera() {
  cameraRig.yaw = -0.72;
  cameraRig.pitch = 0.72;
  cameraRig.distance = 17;
  cameraRig.targetY = 2.2;
  flashStatus("Camera reset", 800);
}

function updateCamera() {
  const pitch = Math.max(0.18, Math.min(1.35, cameraRig.pitch));
  const x = Math.sin(cameraRig.yaw) * Math.cos(pitch) * cameraRig.distance;
  const y = Math.sin(pitch) * cameraRig.distance + cameraRig.targetY;
  const z = Math.cos(cameraRig.yaw) * Math.cos(pitch) * cameraRig.distance;

  camera.position.set(x, y, z);
  camera.lookAt(0, cameraRig.targetY, 0);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function updateSpawnTarget(clientX, clientY) {
  if (world.freezeTarget) return;

  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -(((clientY - rect.top) / rect.height) * 2 - 1),
  );

  raycaster.setFromCamera(mouse, camera);
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = vec3();

  if (raycaster.ray.intersectPlane(ground, hit)) {
    world.spawnTarget.x = Math.max(-world.arena + 1, Math.min(world.arena - 1, hit.x));
    world.spawnTarget.z = Math.max(-world.arena + 1, Math.min(world.arena - 1, hit.z));
    marker.position.set(world.spawnTarget.x, 0.05, world.spawnTarget.z);
  }
}

function simulate(dt) {
  const fixedDt = Math.min(dt, 1 / 30);
  const substeps = Math.max(2, Math.min(8, Math.ceil(world.bodies.length / 30) + 2));
  const step = fixedDt / substeps;

  for (let i = 0; i < substeps; i += 1) {
    integrate(step);
    solveCollisions();
  }
}

function integrate(dt) {
  const gravity = GRAVITY[world.gravity];
  const chaos = world.chaos / 10;
  world.energy = 0;
  let framePeak = 0;

  for (const body of world.bodies) {
    body.vel.x += gravity.x * dt;
    body.vel.y += gravity.y * dt;
    body.vel.z += gravity.z * dt;

    if (world.gravity === "zero") {
      const vortex = vec3(-body.pos.z, 0, body.pos.x).multiplyScalar(0.42 * chaos * dt);
      body.vel.add(vortex);
    }

    if (chaos > 0) {
      body.vel.x += Math.sin(performance.now() * 0.0014 + body.pos.z) * chaos * dt * 1.2;
      body.vel.z += Math.cos(performance.now() * 0.0012 + body.pos.x) * chaos * dt * 1.2;
    }

    body.vel.multiplyScalar(0.999 - Math.min(0.018, body.friction * 0.002));
    body.pos.addScaledVector(body.vel, dt);
    body.angularVel.multiplyScalar(0.995);
    applyRotation(body, dt);
    collideArena(body);
    world.energy += body.vel.lengthSq() * body.mass;
    framePeak = Math.max(framePeak, body.pos.y + body.half);
  }

  world.peakHeight = framePeak;
}

function applyRotation(body, dt) {
  const axis = body.angularVel.clone();
  const speed = axis.length();
  if (speed < 0.0001) return;

  axis.normalize();
  const q = new THREE.Quaternion().setFromAxisAngle(axis, speed * dt);
  body.mesh.quaternion.premultiply(q);
}

function collideArena(body) {
  const h = body.half;
  const min = -world.arena + h;
  const max = world.arena - h;
  const bounce = body.restitution + world.chaos * 0.012;

  if (body.pos.y < h) {
    body.pos.y = h;
    if (body.vel.y < 0) body.vel.y *= -bounce;
    body.vel.x *= 1 - body.friction * 0.065;
    body.vel.z *= 1 - body.friction * 0.065;
    body.angularVel.add(vec3(body.vel.z, 0, -body.vel.x).multiplyScalar(0.22));
  }

  if (body.pos.x < min) {
    body.pos.x = min;
    if (body.vel.x < 0) body.vel.x *= -bounce;
    body.angularVel.z += body.vel.y * 0.2;
  }
  if (body.pos.x > max) {
    body.pos.x = max;
    if (body.vel.x > 0) body.vel.x *= -bounce;
    body.angularVel.z -= body.vel.y * 0.2;
  }
  if (body.pos.z < min) {
    body.pos.z = min;
    if (body.vel.z < 0) body.vel.z *= -bounce;
    body.angularVel.x -= body.vel.y * 0.2;
  }
  if (body.pos.z > max) {
    body.pos.z = max;
    if (body.vel.z > 0) body.vel.z *= -bounce;
    body.angularVel.x += body.vel.y * 0.2;
  }
}

function solveCollisions() {
  const bodies = world.bodies;

  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      solvePair(bodies[i], bodies[j]);
    }
  }
}

function solvePair(a, b) {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dz = b.pos.z - a.pos.z;
  const overlapX = a.half + b.half - Math.abs(dx);
  const overlapY = a.half + b.half - Math.abs(dy);
  const overlapZ = a.half + b.half - Math.abs(dz);

  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return;

  let normal = vec3(Math.sign(dx) || 1, 0, 0);
  let depth = overlapX;

  if (overlapY < depth) {
    normal = vec3(0, Math.sign(dy) || 1, 0);
    depth = overlapY;
  }

  if (overlapZ < depth) {
    normal = vec3(0, 0, Math.sign(dz) || 1);
    depth = overlapZ;
  }

  const invTotal = a.invMass + b.invMass;
  const correction = normal.clone().multiplyScalar((depth + 0.004) / invTotal);
  a.pos.addScaledVector(correction, -a.invMass);
  b.pos.addScaledVector(correction, b.invMass);

  const relative = b.vel.clone().sub(a.vel);
  const normalVelocity = relative.dot(normal);
  if (normalVelocity > 0) return;

  const bounce = Math.min(0.94, Math.max(a.restitution, b.restitution) + world.chaos * 0.015);
  const impulseSize = (-(1 + bounce) * normalVelocity) / invTotal;
  const impulse = normal.clone().multiplyScalar(impulseSize);
  a.vel.addScaledVector(impulse, -a.invMass);
  b.vel.addScaledVector(impulse, b.invMass);

  const tangent = relative.sub(normal.clone().multiplyScalar(normalVelocity));
  if (tangent.lengthSq() > 0.0001) {
    tangent.normalize();
    const friction = Math.min(a.friction, b.friction);
    const frictionImpulse = tangent.multiplyScalar(-impulseSize * friction * 0.08);
    a.vel.addScaledVector(frictionImpulse, -a.invMass);
    b.vel.addScaledVector(frictionImpulse, b.invMass);
  }

  const spin = normal.clone().cross(relative).multiplyScalar(0.18 + world.chaos * 0.02);
  a.angularVel.addScaledVector(spin, -a.invMass);
  b.angularVel.addScaledVector(spin, b.invMass);
}

function syncMeshes() {
  for (const body of world.bodies) {
    body.mesh.position.copy(body.pos);
    updateTrail(body);
  }

  marker.scale.lerp(vec3(1, 1, 1), 0.16);
  marker.rotation.z += 0.012 + world.chaos * 0.002;
}

function updateTrail(body) {
  if (!world.trailsEnabled || world.trailOpacity <= 0) {
    clearTrail(body);
    return;
  }

  if (body.vel.lengthSq() < 26 || body.pos.y < body.half + 0.05) {
    return;
  }

  if (!body.lastTrailPos || body.lastTrailPos.distanceToSquared(body.pos) > 1.35) {
    body.lastTrailPos = body.pos.clone();
    const ghost = new THREE.Mesh(sharedGeometry, body.mesh.material.clone());
    ghost.position.copy(body.pos);
    ghost.quaternion.copy(body.mesh.quaternion);
    ghost.scale.copy(body.mesh.scale);
    ghost.material.transparent = true;
    ghost.material.opacity = world.trailOpacity;
    ghost.material.depthWrite = false;
    scene.add(ghost);
    body.trail.push(ghost);
  }

  while (body.trail.length > world.trailLimit) {
    const old = body.trail.shift();
    scene.remove(old);
    old.material.dispose();
  }

  for (let i = 0; i < body.trail.length; i += 1) {
    const ghost = body.trail[i];
    ghost.material.opacity = world.trailOpacity * ((i + 1) / body.trail.length);
  }
}

function updateHud(now) {
  world.frameCount += 1;
  const elapsed = now - world.fpsStartedAt;
  if (elapsed >= 500) {
    const fps = Math.round((world.frameCount * 1000) / elapsed);
    fpsReadout.textContent = `${fps} fps`;
    world.frameCount = 0;
    world.fpsStartedAt = now;
  }

  cubeCount.textContent = `${world.bodies.length} cubes`;
  energyReadout.textContent = `${Math.round(world.energy)} energy`;
  gravityReadout.textContent = `${world.gravity} gravity`;
  speedReadout.textContent = `${formatNumber(getEffectiveSimSpeed())}x sim`;
  heightReadout.textContent = `${world.peakHeight.toFixed(1)} peak`;
  updateDebugPanel();
}

function animate(now) {
  const dt = Math.min((now - lastNow) / 1000, 0.05);
  lastNow = now;
  const effectiveSpeed = getEffectiveSimSpeed();

  if (world.playing) {
    simulate(dt * effectiveSpeed);
    if (autoDrop.checked && now - world.lastAutoDrop > Math.max(100, 480 - world.chaos * 34)) {
      world.lastAutoDrop = now;
      dropCube(
        world.spawnTarget.x + randomBetween(-1.2, 1.2),
        world.spawnTarget.z + randomBetween(-1.2, 1.2),
      );
    }
    if (world.rainMode && now - world.lastRainDrop > Math.max(60, 180 - world.chaos * 8)) {
      world.lastRainDrop = now;
      dropCube(randomBetween(-7.2, 7.2), randomBetween(-7.2, 7.2), {
        y: randomBetween(10, 18),
        size: world.cubeSize * randomBetween(0.6, 1.15),
      });
    }
  }

  syncMeshes();
  updateCamera();
  updateHud(now);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function wireEvents() {
  window.addEventListener("resize", resize);

  canvas.addEventListener("pointerdown", (event) => {
    pointer.down = true;
    pointer.moved = false;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    updateSpawnTarget(event.clientX, event.clientY);
  });

  canvas.addEventListener("pointermove", (event) => {
    updateSpawnTarget(event.clientX, event.clientY);
    if (!pointer.down) return;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5) {
      pointer.moved = true;
    }

    cameraRig.yaw -= dx * 0.006;
    cameraRig.pitch = Math.max(0.18, Math.min(1.35, cameraRig.pitch + dy * 0.004));
  });

  canvas.addEventListener("pointerup", (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    pointer.down = false;

    if (!pointer.moved) {
      updateSpawnTarget(event.clientX, event.clientY);
      dropCube();
    }
  });

  canvas.addEventListener("pointercancel", () => {
    pointer.down = false;
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    cameraRig.distance = Math.max(8, Math.min(30, cameraRig.distance + event.deltaY * 0.012));
  }, { passive: false });

  playPause.addEventListener("click", () => setPlaying(!world.playing));
  toggleControlsButton.addEventListener("click", () => setControlsOpen(!world.controlsOpen));
  singleStep.addEventListener("click", () => {
    simulate((1 / 60) * getEffectiveSimSpeed());
    syncMeshes();
    renderer.render(scene, camera);
    flashStatus("Single step");
  });
  resetCameraButton.addEventListener("click", resetCamera);
  toggleDebugButton.addEventListener("click", () => setDebugOpen(!world.debugOpen));
  closeDebugButton.addEventListener("click", () => setDebugOpen(false));
  resetScene.addEventListener("click", resetWorld);
  clearScene.addEventListener("click", () => {
    clearWorld();
    flashStatus("Arena cleared");
  });
  dropCubeButton.addEventListener("click", () => {
    dropCube();
    flashStatus("Cube dropped", 700);
  });
  cubeStormButton.addEventListener("click", cubeStorm);
  buildTowerButton.addEventListener("click", buildTower);
  shockwaveButton.addEventListener("click", shockwave);
  spawnRainButton.addEventListener("click", () => toggleRain());
  shuffleSceneButton.addEventListener("click", shuffleScene);

  cubeSize.addEventListener("input", () => {
    world.cubeSize = Number(cubeSize.value);
    sizeOutput.textContent = world.cubeSize.toFixed(2);
    marker.scale.setScalar(0.8 + world.cubeSize * 0.4);
  });

  chaosLevel.addEventListener("input", () => {
    world.chaos = Number(chaosLevel.value);
    chaosOutput.textContent = String(world.chaos);
  });

  gravityControls.addEventListener("click", (event) => {
    const button = event.target.closest(".segment");
    if (!button) return;
    setGravity(button.dataset.gravity);
    flashStatus(`${button.dataset.gravity} gravity`);
  });

  speedControls.addEventListener("click", (event) => {
    const button = event.target.closest(".segment");
    if (!button) return;
    setSpeed(Number(button.dataset.speed));
    flashStatus(`${button.dataset.speed}x simulation`);
  });

  maxBodies.addEventListener("input", () => {
    setMaxBodies(Number(maxBodies.value));
  });

  trailStrength.addEventListener("input", () => {
    setTrailOpacity(Number(trailStrength.value) / 100);
  });

  trailMode.addEventListener("change", () => {
    world.trailsEnabled = trailMode.checked;
    if (!world.trailsEnabled) {
      clearAllTrails();
    }
    flashStatus(world.trailsEnabled ? "Trails enabled" : "Trails disabled");
  });

  debugWireframe.addEventListener("change", () => {
    setWireframe(debugWireframe.checked);
    flashStatus(debugWireframe.checked ? "Wireframe on" : "Wireframe off");
  });

  debugFreezeTarget.addEventListener("change", () => {
    world.freezeTarget = debugFreezeTarget.checked;
    flashStatus(world.freezeTarget ? "Spawn target locked" : "Spawn target unlocked");
  });

  debugShowHud.addEventListener("change", () => {
    setHudVisible(debugShowHud.checked);
    flashStatus(world.showHud ? "HUD visible" : "HUD hidden");
  });

  debugSlowMo.addEventListener("change", () => {
    world.debugSlowMo = debugSlowMo.checked;
    flashStatus(world.debugSlowMo ? "Debug slow motion enabled" : "Debug slow motion disabled");
  });

  debugSpawnBurst.addEventListener("click", spawnDebugBurst);
  debugPurgeTrails.addEventListener("click", () => {
    clearAllTrails();
    flashStatus("Trail effects cleared");
  });
  debugReseed.addEventListener("click", reseedArena);

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      setPlaying(!world.playing);
    }
    if (key === "c") dropCube();
    if (key === "s") cubeStorm();
    if (key === "b") shockwave();
    if (key === "t") buildTower();
    if (key === "r") toggleRain();
    if (key === "v") resetCamera();
    if (key === "x") setControlsOpen(!world.controlsOpen);
    if (key === "d") setDebugOpen(!world.debugOpen);
  });
}

async function start() {
  try {
    setStatus("Loading 3D engine");
    THREE = await loadThree();
    buildScene();
    wireEvents();
    setControlsOpen(false);
    setPlaying(true);
    setGravity(world.gravity);
    setSpeed(world.simSpeed);
    setMaxBodies(world.maxBodies);
    setTrailOpacity(world.trailOpacity);
    setHudVisible(world.showHud);
    setDebugOpen(false);
    setWireframe(false);
    trailMode.checked = world.trailsEnabled;
    debugWireframe.checked = world.debugWireframe;
    debugFreezeTarget.checked = world.freezeTarget;
    debugSlowMo.checked = world.debugSlowMo;
    spawnRainButton.setAttribute("aria-pressed", "false");
    hideStatus();
    lastNow = performance.now();
    requestAnimationFrame(animate);
  } catch (error) {
    console.error(error);
    setStatus("Three.js could not load");
  }
}

sizeOutput.textContent = Number(cubeSize.value).toFixed(2);
chaosOutput.textContent = chaosLevel.value;
maxBodiesOutput.textContent = maxBodies.value;
trailStrengthOutput.textContent = `${trailStrength.value}%`;
start();
