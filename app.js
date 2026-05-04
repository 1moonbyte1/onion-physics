const THREE_URLS = [
  "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "https://unpkg.com/three@0.160.0/build/three.module.js",
];

const CANNON_URLS = [
  "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js",
  "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js",
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
const dropSphereButton = document.querySelector("#dropSphere");
const cubeStormButton = document.querySelector("#cubeStorm");
const buildTowerButton = document.querySelector("#buildTower");
const shockwaveButton = document.querySelector("#shockwave");
const spawnRainButton = document.querySelector("#spawnRain");
const freezeToolButton = document.querySelector("#freezeTool");
const deleteToolButton = document.querySelector("#deleteTool");
const demoSceneButton = document.querySelector("#demoScene");
const shuffleSceneButton = document.querySelector("#shuffleScene");
const cubeMaterial = document.querySelector("#cubeMaterial");
const cubeSize = document.querySelector("#cubeSize");
const sizeOutput = document.querySelector("#sizeOutput");
const chaosLevel = document.querySelector("#chaosLevel");
const chaosOutput = document.querySelector("#chaosOutput");
const blastStrength = document.querySelector("#blastStrength");
const blastStrengthOutput = document.querySelector("#blastStrengthOutput");
const blastRadius = document.querySelector("#blastRadius");
const blastRadiusOutput = document.querySelector("#blastRadiusOutput");
const blastLift = document.querySelector("#blastLift");
const blastLiftOutput = document.querySelector("#blastLiftOutput");
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
const toolReadout = document.querySelector("#toolReadout");
const blastReadout = document.querySelector("#blastReadout");
const materialReadout = document.querySelector("#materialReadout");
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
const materialBounce = document.querySelector("#materialBounce");
const materialWeight = document.querySelector("#materialWeight");
const materialFriction = document.querySelector("#materialFriction");

const MATERIALS = {
  rubber: {
    color: 0x68e07f,
    emissive: 0x092414,
    roughness: 0.5,
    metalness: 0.02,
    density: 0.85,
    restitution: 0.82,
    friction: 0.48,
    linearDamping: 0.015,
    angularDamping: 0.025,
  },
  ice: {
    color: 0x7bc8ff,
    emissive: 0x071b2c,
    roughness: 0.16,
    metalness: 0.05,
    density: 0.72,
    restitution: 0.34,
    friction: 0.02,
    linearDamping: 0.004,
    angularDamping: 0.006,
  },
  metal: {
    color: 0xb9bec8,
    emissive: 0x0a0b0c,
    roughness: 0.36,
    metalness: 0.82,
    density: 2.35,
    restitution: 0.18,
    friction: 0.38,
    linearDamping: 0.008,
    angularDamping: 0.014,
  },
  foam: {
    color: 0xffcb63,
    emissive: 0x301c05,
    roughness: 0.74,
    metalness: 0.0,
    density: 0.38,
    restitution: 0.55,
    friction: 0.78,
    linearDamping: 0.035,
    angularDamping: 0.048,
  },
};

const GRAVITY = {
  earth: { x: 0, y: -16.5, z: 0, label: "earth gravity" },
  moon: { x: 0, y: -3.2, z: 0, label: "moon gravity" },
  zero: { x: 0, y: 0, z: 0, label: "zero gravity" },
  side: { x: 11, y: -4.5, z: 0, label: "side gravity" },
};

const app = {
  arena: 9,
  bodies: [],
  trails: [],
  targetMarkers: [],
  maxBodies: Number(maxBodies.value),
  playing: true,
  gravity: "earth",
  simSpeed: 1,
  cubeSize: Number(cubeSize.value),
  chaos: Number(chaosLevel.value),
  tool: "cube",
  blastStrength: Number(blastStrength.value),
  blastRadius: Number(blastRadius.value),
  blastLift: Number(blastLift.value),
  spawnTarget: { x: 0, z: 0 },
  controlsOpen: false,
  debugOpen: false,
  blastMode: false,
  rainMode: false,
  trailsEnabled: trailMode.checked,
  trailOpacity: Number(trailStrength.value) / 100,
  debugWireframe: false,
  freezeTarget: false,
  debugSlowMo: false,
  showHud: true,
  lastAutoDrop: 0,
  lastRainDrop: 0,
  lastTrailAt: 0,
  energy: 0,
  peakHeight: 0,
  frameCount: 0,
  fpsStartedAt: performance.now(),
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
let CANNON;
let renderer;
let scene;
let camera;
let raycaster;
let marker;
let sharedGeometry;
let sharedSphereGeometry;
let arenaGroup;
let blastPreview;
let physicsWorld;
let staticMaterial;
let physicsMaterials = {};
let fixedTimeStep = 1 / 60;
let lastNow = performance.now();

async function loadModule(urls, label) {
  let lastError;

  for (const url of urls) {
    try {
      return await import(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`${label} could not load`);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function lengthSquared(vector) {
  return vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
}

function setStatus(text) {
  loadout.textContent = text;
  loadout.classList.remove("hidden");
}

function hideStatus() {
  loadout.classList.add("hidden");
}

function flashStatus(text, duration = 900) {
  setStatus(text);
  window.clearTimeout(flashStatus.timeout);
  flashStatus.timeout = window.setTimeout(hideStatus, duration);
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10130f);
  scene.fog = new THREE.Fog(0x10130f, 20, 54);

  camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x10130f, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  sharedGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
  sharedSphereGeometry = new THREE.SphereGeometry(0.5, 32, 18);
  setupPhysics();
  addLights();
  addArena();
  addMarker();
  addBlastPreview();
  resetWorld();
  updateCamera();
}

function setupPhysics() {
  physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -16.5, 0),
  });
  physicsWorld.allowSleep = true;
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
  physicsWorld.solver.iterations = 18;
  physicsWorld.solver.tolerance = 0.001;
  physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e7;
  physicsWorld.defaultContactMaterial.contactEquationRelaxation = 4;
  physicsWorld.defaultContactMaterial.friction = 0.35;
  physicsWorld.defaultContactMaterial.restitution = 0.25;

  staticMaterial = new CANNON.Material("arena");
  physicsMaterials = {};

  for (const [name, spec] of Object.entries(MATERIALS)) {
    physicsMaterials[name] = new CANNON.Material(name);
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(physicsMaterials[name], staticMaterial, {
        friction: spec.friction,
        restitution: spec.restitution,
        contactEquationStiffness: 1e7,
        contactEquationRelaxation: 4,
      }),
    );
  }

  const entries = Object.entries(MATERIALS);
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i; j < entries.length; j += 1) {
      const [nameA, a] = entries[i];
      const [nameB, b] = entries[j];
      physicsWorld.addContactMaterial(
        new CANNON.ContactMaterial(physicsMaterials[nameA], physicsMaterials[nameB], {
          friction: Math.sqrt(a.friction * b.friction),
          restitution: Math.max(a.restitution, b.restitution),
          contactEquationStiffness: 1e7,
          contactEquationRelaxation: 4,
        }),
      );
    }
  }

  addStaticBody(new CANNON.Vec3(0, -0.25, 0), new CANNON.Vec3(app.arena, 0.25, app.arena));
  addStaticBody(new CANNON.Vec3(0, 2.5, -app.arena), new CANNON.Vec3(app.arena, 2.5, 0.22));
  addStaticBody(new CANNON.Vec3(0, 2.5, app.arena), new CANNON.Vec3(app.arena, 2.5, 0.22));
  addStaticBody(new CANNON.Vec3(-app.arena, 2.5, 0), new CANNON.Vec3(0.22, 2.5, app.arena));
  addStaticBody(new CANNON.Vec3(app.arena, 2.5, 0), new CANNON.Vec3(0.22, 2.5, app.arena));
}

function addStaticBody(position, halfExtents) {
  const body = new CANNON.Body({
    mass: 0,
    material: staticMaterial,
    position,
    type: CANNON.Body.STATIC,
  });
  body.addShape(new CANNON.Box(halfExtents));
  physicsWorld.addBody(body);
  return body;
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

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(app.arena * 2, 0.5, app.arena * 2),
    new THREE.MeshStandardMaterial({
      color: 0x202820,
      roughness: 0.7,
      metalness: 0.08,
    }),
  );
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  arenaGroup.add(floor);

  const grid = new THREE.GridHelper(app.arena * 2, 18, 0x73e0bc, 0x3d554a);
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
    [app.arena * 2, 5, 0.44, 0, 2.5, -app.arena],
    [app.arena * 2, 5, 0.44, 0, 2.5, app.arena],
    [0.44, 5, app.arena * 2, -app.arena, 2.5, 0],
    [0.44, 5, app.arena * 2, app.arena, 2.5, 0],
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
  marker.position.set(0, 0.05, 0);
  scene.add(marker);
}

function addBlastPreview() {
  blastPreview = new THREE.Group();
  blastPreview.visible = false;

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(1, 72),
    new THREE.MeshBasicMaterial({
      color: 0xff7b54,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  fill.rotation.x = -Math.PI / 2;
  blastPreview.add(fill);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.018, 8, 96),
    new THREE.MeshBasicMaterial({
      color: 0xff7b54,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  blastPreview.add(ring);

  blastPreview.position.set(0, 0.07, 0);
  scene.add(blastPreview);
  updateBlastPreview();
}

function createVisualMaterial(type) {
  const spec = MATERIALS[type];
  return new THREE.MeshStandardMaterial({
    color: spec.color,
    emissive: spec.emissive,
    roughness: spec.roughness,
    metalness: spec.metalness,
    wireframe: app.debugWireframe,
  });
}

function createBody(type, x, y, z, size, velocity = null, shapeKind = "cube") {
  const spec = MATERIALS[type];
  const half = size / 2;
  const volume = shapeKind === "sphere" ? (4 / 3) * Math.PI * half * half * half : size * size * size;
  const mass = Math.max(0.05, spec.density * volume);
  const shape = shapeKind === "sphere" ? new CANNON.Sphere(half) : new CANNON.Box(new CANNON.Vec3(half, half, half));
  const body = new CANNON.Body({
    mass,
    material: physicsMaterials[type],
    position: new CANNON.Vec3(x, y, z),
    linearDamping: spec.linearDamping,
    angularDamping: spec.angularDamping,
    allowSleep: true,
    sleepSpeedLimit: 0.08,
    sleepTimeLimit: 1.2,
  });
  body.addShape(shape);
  body.quaternion.setFromEuler(randomBetween(-0.5, 0.5), randomBetween(-0.5, 0.5), randomBetween(-0.5, 0.5));

  if (velocity) {
    body.velocity.set(velocity.x, velocity.y, velocity.z);
  } else {
    body.velocity.set(randomBetween(-1, 1), randomBetween(0.4, 2), randomBetween(-1, 1));
  }

  body.angularVelocity.set(randomBetween(-3, 3), randomBetween(-3, 3), randomBetween(-3, 3));
  physicsWorld.addBody(body);

  const mesh = new THREE.Mesh(shapeKind === "sphere" ? sharedSphereGeometry : sharedGeometry, createVisualMaterial(type));
  mesh.scale.setScalar(size);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const entry = {
    shapeKind,
    type,
    size,
    originalMass: mass,
    frozen: false,
    body,
    mesh,
    birth: performance.now(),
  };
  mesh.userData.bodyEntry = entry;

  app.bodies.push(entry);
  while (app.bodies.length > app.maxBodies) {
    removeBody(app.bodies[0]);
  }

  return entry;
}

function removeBody(entry) {
  const index = app.bodies.indexOf(entry);
  if (index >= 0) app.bodies.splice(index, 1);
  physicsWorld.removeBody(entry.body);
  scene.remove(entry.mesh);
  entry.mesh.material.dispose();
}

function clearWorld() {
  for (const entry of [...app.bodies]) removeBody(entry);
  clearAllTrails();
  clearTargetMarkers();
  app.energy = 0;
  app.peakHeight = 0;
}

function resetWorld() {
  clearWorld();
  buildTower(0, -1.65, 0.95, false);

  for (let i = 0; i < 8; i += 1) {
    createBody(
      i % 2 === 0 ? "ice" : "foam",
      randomBetween(-4.5, 4.5),
      randomBetween(5, 10),
      randomBetween(-3.5, 4.5),
      randomBetween(0.55, 0.9),
    );
  }

  flashStatus("Physics reset", 700);
}

function resetDemoScene() {
  clearWorld();
  setTool("cube", { silent: true });
  buildTower(-3.2, -2.8, 0.82, false);
  buildTower(3.0, 2.5, 0.72, false);

  const looseBodies = [
    ["rubber", "sphere", -5.8, 5.4, 1.05],
    ["ice", "sphere", -4.6, 4.6, 0.86],
    ["metal", "cube", 4.8, -4.8, 0.9],
    ["foam", "cube", 5.8, -3.7, 1.0],
    ["ice", "cube", 0.2, 4.6, 0.78],
    ["foam", "sphere", 1.3, 5.3, 0.95],
  ];

  for (const [type, shapeKind, x, z, size] of looseBodies) {
    createBody(type, x, randomBetween(3.5, 7.2), z, size, { x: 0, y: 0, z: 0 }, shapeKind);
  }

  const targets = [
    [-6.2, 0.4],
    [0, 0.8],
    [6.2, 0.4],
  ];

  for (const [x, z] of targets) {
    addTargetMarker(x, z);
    createBody("metal", x, 1.1, z, 0.88, { x: 0, y: 0, z: 0 }, "sphere");
  }

  flashStatus("Demo scene loaded", 900);
}

function addTargetMarker(x, z) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.035, 8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xff7b54,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, 0.075, z);
  scene.add(ring);
  app.targetMarkers.push(ring);
}

function clearTargetMarkers() {
  for (const markerMesh of app.targetMarkers) {
    scene.remove(markerMesh);
    markerMesh.geometry.dispose();
    markerMesh.material.dispose();
  }
  app.targetMarkers.length = 0;
}

function dropCube(x = app.spawnTarget.x, z = app.spawnTarget.z, options = {}) {
  const type = options.type || cubeMaterial.value;
  const size = options.size || app.cubeSize;
  const chaos = app.chaos / 10;
  const velocity = {
    x: randomBetween(-1.2, 1.2) * chaos,
    y: randomBetween(-0.2, 1.2),
    z: randomBetween(-1.2, 1.2) * chaos,
  };

  const entry = createBody(type, x, options.y || randomBetween(7, 10.5), z, size, velocity, "cube");
  entry.body.angularVelocity.x *= 1 + chaos * 0.8;
  entry.body.angularVelocity.y *= 1 + chaos * 0.8;
  entry.body.angularVelocity.z *= 1 + chaos * 0.8;
  marker.scale.setScalar(0.9 + size * 0.45);
  return entry;
}

function dropSphere(x = app.spawnTarget.x, z = app.spawnTarget.z, options = {}) {
  const type = options.type || cubeMaterial.value;
  const size = options.size || app.cubeSize;
  const chaos = app.chaos / 10;
  const velocity = {
    x: randomBetween(-1.8, 1.8) * chaos,
    y: randomBetween(0.2, 1.8),
    z: randomBetween(-1.8, 1.8) * chaos,
  };
  const entry = createBody(type, x, options.y || randomBetween(7, 10.5), z, size, velocity, "sphere");
  entry.body.angularVelocity.set(randomBetween(-4, 4), randomBetween(-4, 4), randomBetween(-4, 4));
  marker.scale.setScalar(0.9 + size * 0.45);
  return entry;
}

function cubeStorm() {
  const count = 18 + app.chaos * 2;
  for (let i = 0; i < count; i += 1) {
    const drop = Math.random() < 0.35 ? dropSphere : dropCube;
    drop(randomBetween(-6.6, 6.6), randomBetween(-6.6, 6.6), {
      y: randomBetween(8, 17),
      size: app.cubeSize * randomBetween(0.65, 1.2),
    });
  }
  flashStatus("Physics storm", 800);
}

function buildTower(centerX = app.spawnTarget.x, centerZ = app.spawnTarget.z, size = app.cubeSize, announce = true) {
  const levels = 5;
  const gap = size * 1.02;
  const baseY = size / 2 + 0.02;
  const pattern = [
    [-gap, 0],
    [0, 0],
    [gap, 0],
  ];

  for (let level = 0; level < levels; level += 1) {
    const rotate = level % 2 === 1;
    for (const [ox, oz] of pattern) {
      const x = centerX + (rotate ? 0 : ox);
      const z = centerZ + (rotate ? ox : oz);
      const entry = createBody("rubber", x, baseY + level * gap, z, size, { x: 0, y: 0, z: 0 });
      entry.body.quaternion.setFromEuler(0, rotate ? Math.PI / 2 : 0, 0);
      entry.body.angularVelocity.set(0, 0, 0);
    }
  }

  if (announce) flashStatus("Tower built", 800);
}

function shockwave(x = app.spawnTarget.x, z = app.spawnTarget.z, options = {}) {
  const origin = { x, y: 0.35, z };
  const radius = app.blastRadius;
  const launch = app.blastStrength;
  const lift = app.blastLift;
  let affected = 0;

  for (const entry of app.bodies) {
    const p = entry.body.position;
    const dx = p.x - origin.x;
    const dz = p.z - origin.z;
    const horizontalDistance = Math.hypot(dx, dz);
    const verticalPenalty = Math.max(0, p.y - origin.y) * 0.18;
    const distance = Math.max(0.25, horizontalDistance + verticalPenalty);
    const reach = radius + entry.size * 0.8;
    if (distance > reach) continue;

    const rawFalloff = Math.max(0, 1 - distance / reach);
    const falloff = rawFalloff * rawFalloff * (3 - 2 * rawFalloff);
    const directionX = horizontalDistance > 0.001 ? dx / horizontalDistance : randomBetween(-1, 1);
    const directionZ = horizontalDistance > 0.001 ? dz / horizontalDistance : randomBetween(-1, 1);
    const massScale = entry.body.mass;
    const impulse = new CANNON.Vec3(
      directionX * launch * falloff * massScale,
      lift * (0.38 + falloff) * falloff * massScale,
      directionZ * launch * falloff * massScale,
    );
    const contactPoint = new CANNON.Vec3(
      randomBetween(-entry.size * 0.35, entry.size * 0.35),
      randomBetween(-entry.size * 0.15, entry.size * 0.35),
      randomBetween(-entry.size * 0.35, entry.size * 0.35),
    );

    entry.body.wakeUp();
    entry.body.applyImpulse(impulse, contactPoint);
    affected += 1;
  }

  addShockRing(origin);
  marker.scale.setScalar(1.65);
  if (!options.silent) flashStatus(`Blast hit ${affected} cubes`, 750);
}

function shuffleScene() {
  const power = 2.5 + app.chaos * 0.45;
  for (const entry of app.bodies) {
    entry.body.wakeUp();
    entry.body.applyImpulse(
      new CANNON.Vec3(randomBetween(-power, power), randomBetween(1, power * 1.4), randomBetween(-power, power)),
      new CANNON.Vec3(randomBetween(-0.4, 0.4), randomBetween(-0.4, 0.4), randomBetween(-0.4, 0.4)),
    );
  }
  flashStatus("Scene shuffled", 700);
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

function toggleRain(force = null) {
  app.rainMode = force === null ? !app.rainMode : force;
  spawnRainButton.classList.toggle("active", app.rainMode);
  spawnRainButton.setAttribute("aria-pressed", String(app.rainMode));
  flashStatus(app.rainMode ? "Rain enabled" : "Rain disabled");
}

function setTool(tool, options = {}) {
  app.tool = tool;
  app.blastMode = tool === "blast";

  const activeButtons = [
    [dropCubeButton, "cube"],
    [dropSphereButton, "sphere"],
    [shockwaveButton, "blast"],
    [freezeToolButton, "freeze"],
    [deleteToolButton, "delete"],
  ];

  for (const [button, buttonTool] of activeButtons) {
    const active = tool === buttonTool;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }

  document.body.classList.toggle("blast-mode", tool === "blast");
  document.body.classList.toggle("freeze-mode", tool === "freeze");
  document.body.classList.toggle("delete-mode", tool === "delete");

  if (marker?.material) {
    const color = tool === "blast" ? 0xff7b54 : tool === "freeze" ? 0x55a8ff : tool === "delete" ? 0xff5454 : 0x73e0bc;
    marker.material.color.setHex(color);
    marker.material.opacity = tool === "cube" || tool === "sphere" ? 0.78 : 0.92;
  }

  updateBlastPreview();
  updateToolReadouts();

  if (!options.silent) {
    const labels = {
      cube: "Cube tool",
      sphere: "Sphere tool",
      blast: "Blast armed: click the arena",
      freeze: "Freeze tool: click an object",
      delete: "Delete tool: click an object",
    };
    flashStatus(labels[tool], 950);
  }
}

function toggleBlastMode(force = null) {
  if (force === true) {
    setTool("blast");
    return;
  }
  if (force === false) {
    setTool(app.tool === "blast" ? "cube" : app.tool, { silent: true });
    return;
  }
  setTool(app.tool === "blast" ? "cube" : "blast");
}

function updateBlastSettings() {
  app.blastStrength = Number(blastStrength.value);
  app.blastRadius = Number(blastRadius.value);
  app.blastLift = Number(blastLift.value);
  blastStrengthOutput.textContent = app.blastStrength.toFixed(1);
  blastRadiusOutput.textContent = app.blastRadius.toFixed(1);
  blastLiftOutput.textContent = app.blastLift.toFixed(1);
  updateBlastPreview();
  updateToolReadouts();
}

function updateBlastPreview() {
  if (!blastPreview) return;
  blastPreview.visible = app.tool === "blast";
  blastPreview.position.set(app.spawnTarget.x, 0.075, app.spawnTarget.z);
  blastPreview.scale.setScalar(app.blastRadius);
}

function updateMaterialStats() {
  const type = cubeMaterial.value;
  const spec = MATERIALS[type];
  materialBounce.textContent = `Bounce ${Math.round(spec.restitution * 100)}%`;
  materialWeight.textContent = `Weight ${spec.density.toFixed(2)}`;
  materialFriction.textContent = `Friction ${Math.round(spec.friction * 100)}%`;
  updateToolReadouts();
}

function updateToolReadouts() {
  const material = MATERIALS[cubeMaterial.value];
  toolReadout.textContent = `${app.tool} tool`;
  blastReadout.textContent = `blast ${app.blastStrength.toFixed(1)} / ${app.blastRadius.toFixed(1)} / ${app.blastLift.toFixed(1)}`;
  materialReadout.textContent = `${cubeMaterial.value} ${Math.round(material.restitution * 100)}% bounce`;
}

function spawnDebugBurst() {
  for (let i = 0; i < 12; i += 1) {
    const drop = Math.random() < 0.5 ? dropSphere : dropCube;
    drop(app.spawnTarget.x + randomBetween(-1.5, 1.5), app.spawnTarget.z + randomBetween(-1.5, 1.5), {
      y: randomBetween(7, 13),
      size: app.cubeSize * randomBetween(0.75, 1.15),
    });
  }
  flashStatus("Debug burst", 700);
}

function reseedArena() {
  resetWorld();
}

function setPlaying(playing) {
  app.playing = playing;
  playPauseIcon.textContent = playing ? "||" : ">";
  playPause.setAttribute("aria-label", playing ? "Pause simulation" : "Play simulation");
  playPause.title = playing ? "Pause" : "Play";
}

function setGravity(name) {
  app.gravity = name;
  const gravity = GRAVITY[name];
  physicsWorld.gravity.set(gravity.x, gravity.y, gravity.z);
  for (const button of gravityControls.querySelectorAll(".segment")) {
    button.classList.toggle("active", button.dataset.gravity === name);
  }
  gravityReadout.textContent = gravity.label;
}

function setSpeed(speed) {
  app.simSpeed = speed;
  for (const button of speedControls.querySelectorAll(".segment")) {
    button.classList.toggle("active", Number(button.dataset.speed) === speed);
  }
  speedReadout.textContent = `${speed}x sim`;
}

function setMaxBodies(count) {
  app.maxBodies = count;
  maxBodies.value = String(count);
  maxBodiesOutput.textContent = String(count);
  while (app.bodies.length > app.maxBodies) removeBody(app.bodies[0]);
}

function setTrailOpacity(opacity) {
  app.trailOpacity = opacity;
  trailStrength.value = String(Math.round(opacity * 100));
  trailStrengthOutput.textContent = `${Math.round(opacity * 100)}%`;
}

function setHudVisible(visible) {
  app.showHud = visible;
  hud.classList.toggle("hidden", !visible);
  debugShowHud.checked = visible;
}

function setWireframe(enabled) {
  app.debugWireframe = enabled;
  debugWireframe.checked = enabled;
  for (const entry of app.bodies) {
    entry.mesh.material.wireframe = enabled;
  }
}

function setControlsOpen(open) {
  app.controlsOpen = open;
  controlDock.classList.toggle("collapsed", !open);
  toggleControlsButton.classList.toggle("active", open);
  toggleControlsButton.setAttribute("aria-expanded", String(open));
  toggleControlsLabel.textContent = open ? "Hide" : "Controls";
  document.body.classList.toggle("controls-open", open);
}

function setDebugOpen(open) {
  app.debugOpen = open;
  debugPanel.classList.toggle("hidden", !open);
  toggleDebugButton.classList.toggle("active", open);
}

function resetCamera() {
  cameraRig.yaw = -0.72;
  cameraRig.pitch = 0.72;
  cameraRig.distance = 17;
  cameraRig.targetY = 2.2;
  flashStatus("Camera reset", 700);
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

function updateSpawnTarget(clientX, clientY) {
  if (app.freezeTarget) return;

  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -(((clientY - rect.top) / rect.height) * 2 - 1),
  );

  raycaster.setFromCamera(mouse, camera);
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  if (raycaster.ray.intersectPlane(ground, hit)) {
    app.spawnTarget.x = Math.max(-app.arena + 1, Math.min(app.arena - 1, hit.x));
    app.spawnTarget.z = Math.max(-app.arena + 1, Math.min(app.arena - 1, hit.z));
    marker.position.set(app.spawnTarget.x, 0.05, app.spawnTarget.z);
    updateBlastPreview();
  }
}

function pickBody(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -(((clientY - rect.top) / rect.height) * 2 - 1),
  );
  raycaster.setFromCamera(mouse, camera);
  const intersections = raycaster.intersectObjects(app.bodies.map((entry) => entry.mesh), false);
  return intersections.length > 0 ? intersections[0].object.userData.bodyEntry : null;
}

function toggleFreezeEntry(entry) {
  entry.frozen = !entry.frozen;

  if (entry.frozen) {
    entry.body.velocity.set(0, 0, 0);
    entry.body.angularVelocity.set(0, 0, 0);
    entry.body.mass = 0;
    entry.body.type = CANNON.Body.STATIC;
    entry.body.updateMassProperties();
    entry.body.sleep();
    entry.mesh.material.emissive.setHex(0x103a5c);
    flashStatus("Object frozen", 650);
    return;
  }

  entry.body.type = CANNON.Body.DYNAMIC;
  entry.body.mass = entry.originalMass;
  entry.body.updateMassProperties();
  entry.body.wakeUp();
  entry.mesh.material.emissive.setHex(MATERIALS[entry.type].emissive);
  flashStatus("Object unfrozen", 650);
}

function runCanvasTool(event) {
  if (app.tool === "freeze" || app.tool === "delete") {
    const entry = pickBody(event.clientX, event.clientY);
    if (!entry) {
      flashStatus(app.tool === "freeze" ? "No object to freeze" : "No object to delete", 650);
      return;
    }

    if (app.tool === "freeze") {
      toggleFreezeEntry(entry);
    } else {
      removeBody(entry);
      flashStatus("Object deleted", 650);
    }
    return;
  }

  updateSpawnTarget(event.clientX, event.clientY);

  if (app.tool === "blast") {
    shockwave(app.spawnTarget.x, app.spawnTarget.z);
  } else if (app.tool === "sphere") {
    dropSphere();
    flashStatus("Sphere dropped", 600);
  } else {
    dropCube();
    flashStatus("Cube dropped", 600);
  }
}

function getEffectiveSimSpeed() {
  return app.simSpeed * (app.debugSlowMo ? 0.22 : 1);
}

function simulate(dt) {
  const gravity = GRAVITY[app.gravity];
  physicsWorld.gravity.set(gravity.x, gravity.y, gravity.z);

  if (app.gravity === "zero") {
    applyZeroGravityDrift(dt);
  } else if (app.chaos >= 7) {
    applyHighChaosWind(dt);
  }

  physicsWorld.step(fixedTimeStep, Math.min(dt, 0.08), 8);
}

function applyZeroGravityDrift(dt) {
  const strength = 1.2 + app.chaos * 0.22;
  for (const entry of app.bodies) {
    const p = entry.body.position;
    const force = new CANNON.Vec3(-p.z * strength, 0, p.x * strength);
    entry.body.applyForce(force, new CANNON.Vec3(0, 0, 0));
  }
}

function applyHighChaosWind(dt) {
  const strength = (app.chaos - 6) * 0.55;
  const now = performance.now() * 0.001;
  for (const entry of app.bodies) {
    const p = entry.body.position;
    const force = new CANNON.Vec3(
      Math.sin(now + p.z * 0.4) * strength,
      0,
      Math.cos(now + p.x * 0.4) * strength,
    );
    entry.body.applyForce(force, new CANNON.Vec3(0, 0, 0));
  }
}

function syncMeshes(now) {
  app.energy = 0;
  app.peakHeight = 0;

  for (const entry of app.bodies) {
    const body = entry.body;
    entry.mesh.position.set(body.position.x, body.position.y, body.position.z);
    entry.mesh.quaternion.copy(body.quaternion);

    const speedSq = lengthSquared(body.velocity);
    app.energy += speedSq * body.mass;
    app.peakHeight = Math.max(app.peakHeight, body.position.y);
  }

  marker.scale.lerp(new THREE.Vector3(1, 1, 1), 0.16);
  marker.rotation.z += 0.012 + app.chaos * 0.001;

  if (app.trailsEnabled && now - app.lastTrailAt > Math.max(30, 150 - app.chaos * 8)) {
    app.lastTrailAt = now;
    addTrails();
  }

  updateTrails();
}

function addTrails() {
  const fastBodies = app.bodies.filter((entry) => lengthSquared(entry.body.velocity) > 10).slice(-12);

  for (const entry of fastBodies) {
    const material = new THREE.MeshBasicMaterial({
      color: MATERIALS[entry.type].color,
      transparent: true,
      opacity: app.trailOpacity,
      depthWrite: false,
      wireframe: true,
    });
    const ghost = new THREE.Mesh(entry.mesh.geometry, material);
    ghost.position.copy(entry.mesh.position);
    ghost.quaternion.copy(entry.mesh.quaternion);
    ghost.scale.copy(entry.mesh.scale);
    scene.add(ghost);
    app.trails.push({ mesh: ghost, createdAt: performance.now(), life: 650 });
  }

  while (app.trails.length > 120) {
    removeTrail(app.trails[0]);
  }
}

function updateTrails() {
  const now = performance.now();
  for (const trail of [...app.trails]) {
    const age = now - trail.createdAt;
    const t = age / trail.life;
    trail.mesh.material.opacity = app.trailOpacity * Math.max(0, 1 - t);
    trail.mesh.scale.multiplyScalar(1.006);
    if (t >= 1) removeTrail(trail);
  }
}

function removeTrail(trail) {
  const index = app.trails.indexOf(trail);
  if (index >= 0) app.trails.splice(index, 1);
  scene.remove(trail.mesh);
  trail.mesh.material.dispose();
}

function clearAllTrails() {
  for (const trail of [...app.trails]) removeTrail(trail);
}

function updateHud(now) {
  app.frameCount += 1;
  const elapsed = now - app.fpsStartedAt;
  if (elapsed >= 500) {
    const fps = Math.round((app.frameCount * 1000) / elapsed);
    fpsReadout.textContent = `${fps} fps`;
    app.frameCount = 0;
    app.fpsStartedAt = now;
  }

  cubeCount.textContent = `${app.bodies.length} bodies`;
  energyReadout.textContent = `${Math.round(app.energy)} energy`;
  heightReadout.textContent = `${app.peakHeight.toFixed(1)} peak`;
  debugBodies.textContent = `${app.bodies.length} / ${app.maxBodies}`;
  debugGravity.textContent = `${GRAVITY[app.gravity].x}, ${GRAVITY[app.gravity].y}, ${GRAVITY[app.gravity].z}`;
  debugSpawn.textContent = `${app.spawnTarget.x.toFixed(1)}, ${app.spawnTarget.z.toFixed(1)}`;
  debugCamera.textContent = `${cameraRig.distance.toFixed(1)} / ${cameraRig.yaw.toFixed(2)} / ${cameraRig.pitch.toFixed(2)}`;
  debugSnapshot.textContent = JSON.stringify(
    {
      bodies: app.bodies.length,
      cubes: app.bodies.filter((entry) => entry.shapeKind === "cube").length,
      spheres: app.bodies.filter((entry) => entry.shapeKind === "sphere").length,
      frozen: app.bodies.filter((entry) => entry.frozen).length,
      gravity: app.gravity,
      simSpeed: app.simSpeed,
      tool: app.tool,
      blastMode: app.blastMode,
      blast: {
        strength: app.blastStrength,
        radius: app.blastRadius,
        lift: app.blastLift,
      },
      chaos: app.chaos,
      peak: Number(app.peakHeight.toFixed(2)),
      energy: Math.round(app.energy),
      solver: {
        engine: "cannon-es",
        fixedTimeStep,
        iterations: physicsWorld.solver.iterations,
      },
    },
    null,
    2,
  );
}

function animate(now) {
  const dt = Math.min((now - lastNow) / 1000, 0.05);
  lastNow = now;
  const effectiveSpeed = getEffectiveSimSpeed();

  if (app.playing) {
    simulate(dt * effectiveSpeed);

    if (autoDrop.checked && now - app.lastAutoDrop > Math.max(140, 620 - app.chaos * 35)) {
      app.lastAutoDrop = now;
      dropCube(app.spawnTarget.x + randomBetween(-1.1, 1.1), app.spawnTarget.z + randomBetween(-1.1, 1.1));
    }

    if (app.rainMode && now - app.lastRainDrop > Math.max(80, 230 - app.chaos * 9)) {
      app.lastRainDrop = now;
      const drop = Math.random() < 0.4 ? dropSphere : dropCube;
      drop(randomBetween(-7.1, 7.1), randomBetween(-7.1, 7.1), {
        y: randomBetween(10, 18),
        size: app.cubeSize * randomBetween(0.62, 1.1),
      });
    }
  }

  syncMeshes(now);
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
      runCanvasTool(event);
    }
  });

  canvas.addEventListener("pointercancel", () => {
    pointer.down = false;
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    cameraRig.distance = Math.max(8, Math.min(30, cameraRig.distance + event.deltaY * 0.012));
  }, { passive: false });

  playPause.addEventListener("click", () => setPlaying(!app.playing));
  toggleControlsButton.addEventListener("click", () => setControlsOpen(!app.controlsOpen));
  singleStep.addEventListener("click", () => {
    simulate((1 / 60) * getEffectiveSimSpeed());
    syncMeshes(performance.now());
    renderer.render(scene, camera);
    flashStatus("Single step");
  });
  resetCameraButton.addEventListener("click", resetCamera);
  toggleDebugButton.addEventListener("click", () => setDebugOpen(!app.debugOpen));
  closeDebugButton.addEventListener("click", () => setDebugOpen(false));
  resetScene.addEventListener("click", resetWorld);
  clearScene.addEventListener("click", () => {
    clearWorld();
    flashStatus("Arena cleared");
  });
  dropCubeButton.addEventListener("click", () => setTool("cube"));
  dropSphereButton.addEventListener("click", () => setTool("sphere"));
  cubeStormButton.addEventListener("click", cubeStorm);
  buildTowerButton.addEventListener("click", () => buildTower());
  shockwaveButton.addEventListener("click", () => toggleBlastMode());
  spawnRainButton.addEventListener("click", () => toggleRain());
  freezeToolButton.addEventListener("click", () => setTool(app.tool === "freeze" ? "cube" : "freeze"));
  deleteToolButton.addEventListener("click", () => setTool(app.tool === "delete" ? "cube" : "delete"));
  demoSceneButton.addEventListener("click", resetDemoScene);
  shuffleSceneButton.addEventListener("click", shuffleScene);

  cubeSize.addEventListener("input", () => {
    app.cubeSize = Number(cubeSize.value);
    sizeOutput.textContent = app.cubeSize.toFixed(2);
    marker.scale.setScalar(0.8 + app.cubeSize * 0.4);
  });

  chaosLevel.addEventListener("input", () => {
    app.chaos = Number(chaosLevel.value);
    chaosOutput.textContent = String(app.chaos);
  });

  blastStrength.addEventListener("input", updateBlastSettings);
  blastRadius.addEventListener("input", updateBlastSettings);
  blastLift.addEventListener("input", updateBlastSettings);

  cubeMaterial.addEventListener("change", () => {
    updateMaterialStats();
    flashStatus(`${cubeMaterial.value} material selected`, 650);
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
    app.trailsEnabled = trailMode.checked;
    if (!app.trailsEnabled) clearAllTrails();
    flashStatus(app.trailsEnabled ? "Trails enabled" : "Trails disabled");
  });

  debugWireframe.addEventListener("change", () => {
    setWireframe(debugWireframe.checked);
    flashStatus(debugWireframe.checked ? "Wireframe on" : "Wireframe off");
  });

  debugFreezeTarget.addEventListener("change", () => {
    app.freezeTarget = debugFreezeTarget.checked;
    flashStatus(app.freezeTarget ? "Spawn target locked" : "Spawn target unlocked");
  });

  debugShowHud.addEventListener("change", () => {
    setHudVisible(debugShowHud.checked);
    flashStatus(app.showHud ? "HUD visible" : "HUD hidden");
  });

  debugSlowMo.addEventListener("change", () => {
    app.debugSlowMo = debugSlowMo.checked;
    flashStatus(app.debugSlowMo ? "Debug slow motion enabled" : "Debug slow motion disabled");
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
      setPlaying(!app.playing);
    }
    if (key === "c") setTool("cube");
    if (key === "o") setTool("sphere");
    if (key === "s") cubeStorm();
    if (key === "b") toggleBlastMode();
    if (key === "f") setTool(app.tool === "freeze" ? "cube" : "freeze");
    if (key === "delete" || key === "backspace") {
      event.preventDefault();
      setTool(app.tool === "delete" ? "cube" : "delete");
    }
    if (key === "t") buildTower();
    if (key === "r") toggleRain();
    if (key === "v") resetCamera();
    if (key === "x") setControlsOpen(!app.controlsOpen);
    if (key === "d") setDebugOpen(!app.debugOpen);
  });
}

async function start() {
  try {
    setStatus("Loading 3D renderer");
    THREE = await loadModule(THREE_URLS, "Three.js");
    setStatus("Loading physics engine");
    CANNON = await loadModule(CANNON_URLS, "cannon-es");
    buildScene();
    wireEvents();
    setControlsOpen(false);
    setPlaying(true);
    setGravity(app.gravity);
    setSpeed(app.simSpeed);
    setMaxBodies(app.maxBodies);
    setTrailOpacity(app.trailOpacity);
    setHudVisible(app.showHud);
    setDebugOpen(false);
    setWireframe(false);
    setTool("cube", { silent: true });
    updateBlastSettings();
    updateMaterialStats();
    trailMode.checked = app.trailsEnabled;
    debugWireframe.checked = app.debugWireframe;
    debugFreezeTarget.checked = app.freezeTarget;
    debugSlowMo.checked = app.debugSlowMo;
    spawnRainButton.setAttribute("aria-pressed", "false");
    hideStatus();
    lastNow = performance.now();
    requestAnimationFrame(animate);
  } catch (error) {
    console.error(error);
    setStatus("3D physics engine could not load");
  }
}

sizeOutput.textContent = Number(cubeSize.value).toFixed(2);
chaosOutput.textContent = chaosLevel.value;
blastStrengthOutput.textContent = Number(blastStrength.value).toFixed(1);
blastRadiusOutput.textContent = Number(blastRadius.value).toFixed(1);
blastLiftOutput.textContent = Number(blastLift.value).toFixed(1);
maxBodiesOutput.textContent = maxBodies.value;
trailStrengthOutput.textContent = `${trailStrength.value}%`;
start();
