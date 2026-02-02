import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EEG_64, sphericalToCartesian } from './eeg64';
import { buildGradient } from './colormap';
import { createTopomapMaterial } from './topomapMaterial';
import { fitCameraToObject } from './fitCamera';
import { createProceduralBrain } from './brainProcedural';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing #app element');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05070f');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.className = 'label-layer';
app.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = true;
controls.enableZoom = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.6;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(3, 4, 2);
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(6, 12, 0x24304a, 0x0d1422);
gridHelper.position.y = -0.4;
scene.add(gridHelper);

const headGroup = new THREE.Group();
headGroup.position.y = 0.9;
scene.add(headGroup);

const scalpGeometry = new THREE.SphereGeometry(1.05, 160, 160);
scalpGeometry.scale(1, 1.2, 1);
const scalpMaterial = new THREE.MeshStandardMaterial({
  color: 0x9b8a83,
  roughness: 0.5,
  metalness: 0.05,
  transparent: true,
  opacity: 0.28,
});
const scalpMesh = new THREE.Mesh(scalpGeometry, scalpMaterial);
headGroup.add(scalpMesh);

const noseGeometry = new THREE.ConeGeometry(0.07, 0.22, 28);
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xb19f97, roughness: 0.45 });
const noseMesh = new THREE.Mesh(noseGeometry, noseMaterial);
noseMesh.position.set(0, 0.15, 1.08);
noseMesh.rotation.x = Math.PI * 0.55;
headGroup.add(noseMesh);

const findFirstMesh = (root: THREE.Object3D) => {
  let found: THREE.Mesh | null = null;
  root.traverse((child) => {
    if (found || !(child as THREE.Mesh).isMesh) return;
    found = child as THREE.Mesh;
  });
  return found;
};

let brainRoot: THREE.Object3D | null = null;
let brainMesh: THREE.Mesh = createProceduralBrain();
brainMesh.position.set(0, 0, 0);
headGroup.add(brainMesh);

const loader = new GLTFLoader();
const localBrainUrl = '/assets/brain.glb';
const localHeadUrl = '/assets/head.glb';

const tryLoadLocalModel = (url: string, onLoad: (object: THREE.Object3D) => void) => {
  loader.load(
    url,
    (gltf) => {
      onLoad(gltf.scene);
    },
    undefined,
    () => {
      // Fallback remains procedural
    }
  );
};

tryLoadLocalModel(localBrainUrl, (object) => {
  if (brainRoot) headGroup.remove(brainRoot);
  headGroup.remove(brainMesh);
  brainRoot = object;
  brainRoot.scale.set(1.1, 1.15, 1.1);
  brainRoot.position.set(0, 0, 0);
  const mesh = findFirstMesh(brainRoot);
  if (mesh) {
    brainMesh = mesh;
  }
  brainMesh.add(cortexTopomap);
  cortexTopomap.geometry = brainMesh.geometry;
  cortexTopomap.visible = !showScalp;
  headGroup.add(brainRoot);
  fitCameraToObject(camera, controls, headGroup, 1.35);
});

tryLoadLocalModel(localHeadUrl, (object) => {
  object.scale.set(1.05, 1.2, 1.05);
  object.position.set(0, 0, 0);
  headGroup.add(object);
  fitCameraToObject(camera, controls, headGroup, 1.35);
});

const electrodePositions: THREE.Vector3[] = [];
const electrodePositionsRaised: THREE.Vector3[] = [];
const headScale = new THREE.Vector3(1, 1.2, 1);

EEG_64.forEach((electrode) => {
  const { x, y, z } = sphericalToCartesian(electrode.lat, electrode.lon);
  const scaled = new THREE.Vector3(x * headScale.x, y * headScale.y, z * headScale.z);
  const normal = scaled.clone().normalize();
  electrodePositions.push(scaled);
  electrodePositionsRaised.push(scaled.clone().addScaledVector(normal, 0.03));
});

const values = new Float32Array(EEG_64.length);
const topomapMaterial = createTopomapMaterial(electrodePositions, values, 0.26, -20, 20);
const scalpTopomap = new THREE.Mesh(scalpGeometry, topomapMaterial);
scalpTopomap.renderOrder = 2;
headGroup.add(scalpTopomap);

const cortexTopomap = new THREE.Mesh(brainMesh.geometry, topomapMaterial);
cortexTopomap.renderOrder = 2;
brainMesh.add(cortexTopomap);
cortexTopomap.visible = false;

const electrodeGeometry = new THREE.SphereGeometry(0.03, 18, 18);
const electrodeMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });
const electrodesMesh = new THREE.InstancedMesh(electrodeGeometry, electrodeMaterial, EEG_64.length);
const electrodeColor = new THREE.Color(0x141414);
const highlightColor = new THREE.Color(0xfff1b8);
const matrix = new THREE.Matrix4();

for (let i = 0; i < EEG_64.length; i += 1) {
  matrix.makeTranslation(
    electrodePositionsRaised[i].x,
    electrodePositionsRaised[i].y,
    electrodePositionsRaised[i].z
  );
  electrodesMesh.setMatrixAt(i, matrix);
  electrodesMesh.setColorAt(i, electrodeColor);
}

electrodesMesh.instanceMatrix.needsUpdate = true;
headGroup.add(electrodesMesh);

const labelGroup = new THREE.Group();
const labelObjects: CSS2DObject[] = [];

EEG_64.forEach((electrode, index) => {
  const div = document.createElement('div');
  div.className = 'electrode-label';
  div.textContent = electrode.name;
  const label = new CSS2DObject(div);
  label.position.copy(
    electrodePositionsRaised[index].clone().add(new THREE.Vector3(0, 0.03, 0))
  );
  label.visible = false;
  labelObjects.push(label);
  labelGroup.add(label);
});

headGroup.add(labelGroup);

const ui = document.createElement('div');
ui.className = 'ui';
ui.innerHTML = `
  <div class="panel">
    <h1>EEG 64 导热力图</h1>
    <div class="row">
      <label for="sigma">Sigma</label>
      <input id="sigma" type="range" min="0.12" max="0.35" step="0.01" value="0.26" />
    </div>
    <div class="row">
      <label for="amplitude">Amplitude (µV)</label>
      <input id="amplitude" type="range" min="10" max="30" step="1" value="20" />
    </div>
    <div class="row">
      <label for="gyrification">Gyrification</label>
      <input id="gyrification" type="range" min="0.05" max="0.18" step="0.01" value="0.12" />
    </div>
    <div class="row">
      <label for="mode">放电模式</label>
      <select id="mode">
        <option value="single">Single Hotspot</option>
        <option value="dual">Dual Hotspot</option>
        <option value="random">Random Burst</option>
      </select>
    </div>
    <div class="row">
      <label><input id="autoRotate" type="checkbox" /> Auto Rotate</label>
    </div>
    <div class="row">
      <label><input id="toggleSurface" type="checkbox" checked /> Scalp Surface</label>
    </div>
    <div class="row">
      <label><input id="labels" type="checkbox" /> 显示电极名称</label>
    </div>
    <div class="row">
      <label><input id="grid" type="checkbox" checked /> 显示网格</label>
    </div>
    <div class="status">
      <div>Hover: <span id="hover">--</span></div>
      <div>FPS: <span id="fps">--</span></div>
    </div>
  </div>
  <div class="colorbar">
    <div class="colorbar-gradient"></div>
    <div class="colorbar-labels">
      <span>+A µV</span>
      <span>0</span>
      <span>-A µV</span>
    </div>
  </div>
  <div class="tooltip" id="tooltip"></div>
`;
app.appendChild(ui);

const sigmaInput = ui.querySelector<HTMLInputElement>('#sigma');
const amplitudeInput = ui.querySelector<HTMLInputElement>('#amplitude');
const gyrificationInput = ui.querySelector<HTMLInputElement>('#gyrification');
const modeSelect = ui.querySelector<HTMLSelectElement>('#mode');
const autoRotateToggle = ui.querySelector<HTMLInputElement>('#autoRotate');
const surfaceToggle = ui.querySelector<HTMLInputElement>('#toggleSurface');
const labelsToggle = ui.querySelector<HTMLInputElement>('#labels');
const gridToggle = ui.querySelector<HTMLInputElement>('#grid');
const hoverLabel = ui.querySelector<HTMLSpanElement>('#hover');
const fpsLabel = ui.querySelector<HTMLSpanElement>('#fps');
const tooltip = ui.querySelector<HTMLDivElement>('#tooltip');

const colorbarGradient = ui.querySelector<HTMLDivElement>('.colorbar-gradient');
if (colorbarGradient) {
  colorbarGradient.style.background = buildGradient();
}

let amplitude = 20;
let mode: 'single' | 'dual' | 'random' = 'single';
let showScalp = true;

sigmaInput?.addEventListener('input', (event) => {
  const value = Number((event.target as HTMLInputElement).value);
  topomapMaterial.uniforms.sigma.value = value;
});

amplitudeInput?.addEventListener('input', (event) => {
  amplitude = Number((event.target as HTMLInputElement).value);
  topomapMaterial.uniforms.minValue.value = -amplitude;
  topomapMaterial.uniforms.maxValue.value = amplitude;
  const labels = ui.querySelectorAll<HTMLSpanElement>('.colorbar-labels span');
  if (labels.length === 3) {
    labels[0].textContent = `+${amplitude} µV`;
    labels[2].textContent = `-${amplitude} µV`;
  }
});

gyrificationInput?.addEventListener('input', (event) => {
  const strength = Number((event.target as HTMLInputElement).value);
  if (brainRoot) {
    headGroup.remove(brainRoot);
    brainRoot = null;
  } else {
    headGroup.remove(brainMesh);
  }
  brainMesh = createProceduralBrain({ strength });
  brainMesh.position.set(0, 0, 0);
  headGroup.add(brainMesh);
  brainMesh.add(cortexTopomap);
  cortexTopomap.geometry = brainMesh.geometry;
  fitCameraToObject(camera, controls, headGroup, 1.3);
});

modeSelect?.addEventListener('change', (event) => {
  mode = (event.target as HTMLSelectElement).value as 'single' | 'dual' | 'random';
});

autoRotateToggle?.addEventListener('change', (event) => {
  controls.autoRotate = (event.target as HTMLInputElement).checked;
});

surfaceToggle?.addEventListener('change', (event) => {
  showScalp = (event.target as HTMLInputElement).checked;
  scalpMesh.visible = showScalp;
  scalpTopomap.visible = showScalp;
  cortexTopomap.visible = !showScalp;
});

labelsToggle?.addEventListener('change', (event) => {
  const show = (event.target as HTMLInputElement).checked;
  labelObjects.forEach((label) => {
    label.visible = show;
  });
});

gridToggle?.addEventListener('change', (event) => {
  gridHelper.visible = (event.target as HTMLInputElement).checked;
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredIndex: number | null = null;

const updateHover = () => {
  if (!tooltip) return;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(electrodesMesh);
  if (intersects.length === 0) {
    if (hoveredIndex !== null) {
      electrodesMesh.setColorAt(hoveredIndex, electrodeColor);
      electrodesMesh.instanceColor!.needsUpdate = true;
      hoveredIndex = null;
    }
    tooltip.style.opacity = '0';
    if (hoverLabel) hoverLabel.textContent = '--';
    return;
  }

  const hit = intersects[0];
  const instanceId = hit.instanceId ?? null;
  if (instanceId === null) return;

  if (hoveredIndex !== instanceId) {
    if (hoveredIndex !== null) {
      electrodesMesh.setColorAt(hoveredIndex, electrodeColor);
    }
    electrodesMesh.setColorAt(instanceId, highlightColor);
    electrodesMesh.instanceColor!.needsUpdate = true;
    hoveredIndex = instanceId;
  }

  const electrode = EEG_64[instanceId];
  const value = values[instanceId].toFixed(2);
  if (hoverLabel) hoverLabel.textContent = `${electrode.name} (${value} µV)`;

  const screenPosition = electrodePositionsRaised[instanceId].clone();
  headGroup.localToWorld(screenPosition);
  screenPosition.project(camera);
  const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;
  tooltip.textContent = `${electrode.name}: ${value} µV`;
  tooltip.style.transform = `translate(-50%, -110%) translate(${x}px, ${y}px)`;
  tooltip.style.opacity = '1';
};

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const gaussianAngular = (a: THREE.Vector3, b: THREE.Vector3, spread: number) => {
  const dot = THREE.MathUtils.clamp(a.clone().normalize().dot(b.clone().normalize()), -1, 1);
  const angle = Math.acos(dot);
  return Math.exp(-(angle * angle) / (2 * spread * spread));
};

const randomState = {
  position: new THREE.Vector3(0, 1, 0),
  start: 0,
  duration: 1.6,
  strength: 1,
};

const refreshRandomBurst = (time: number) => {
  const lat = -30 + Math.random() * 60;
  const lon = -120 + Math.random() * 240;
  const { x, y, z } = sphericalToCartesian(lat, lon);
  randomState.position.set(x, y, z);
  randomState.start = time;
  randomState.strength = 0.5 + Math.random() * 0.9;
};

refreshRandomBurst(0);

const updateSimulation = (time: number) => {
  const t = time * 0.001;
  const hotspot1 = sphericalToCartesian(20 + 18 * Math.sin(t * 0.5), 40 * Math.sin(t * 0.3));
  const hotspot2 = sphericalToCartesian(-10 + 12 * Math.sin(t * 0.45 + 1.7), -60 + 35 * Math.cos(t * 0.25));
  const spread = 0.55;
  const phase = Math.sin(t * 1.4);
  const hotspot1Vec = new THREE.Vector3(hotspot1.x, hotspot1.y, hotspot1.z);
  const hotspot2Vec = new THREE.Vector3(hotspot2.x, hotspot2.y, hotspot2.z);

  if (mode === 'random' && t - randomState.start > randomState.duration) {
    refreshRandomBurst(t);
  }

  for (let i = 0; i < EEG_64.length; i += 1) {
    const position = electrodePositions[i];
    let field = 0;

    if (mode === 'single') {
      field = gaussianAngular(position, hotspot1Vec, spread) * phase;
    } else if (mode === 'dual') {
      field =
        gaussianAngular(position, hotspot1Vec, spread) * phase -
        gaussianAngular(position, hotspot2Vec, spread) * Math.cos(t * 1.1);
    } else {
      const burstProgress = THREE.MathUtils.clamp((t - randomState.start) / randomState.duration, 0, 1);
      const burstEnvelope = Math.sin(Math.PI * burstProgress);
      field =
        gaussianAngular(position, randomState.position, 0.45) * burstEnvelope * randomState.strength;
    }

    const alpha = Math.sin(t * 8 + i * 0.3) * 1.8;
    const beta = Math.sin(t * 14 + i * 0.15) * 1.2;
    const value = amplitude * field + alpha + beta;
    values[i] = THREE.MathUtils.clamp(value, -amplitude, amplitude);
  }

  topomapMaterial.uniformsNeedUpdate = true;
};

let lastTime = performance.now();
let fpsSample = 0;
let fpsTimer = 0;

const animate = (time: number) => {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  controls.update();
  updateSimulation(time);
  updateHover();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  fpsSample += 1;
  fpsTimer += delta;
  if (fpsTimer > 0.5) {
    const fps = Math.round(fpsSample / fpsTimer);
    if (fpsLabel) fpsLabel.textContent = fps.toString();
    fpsSample = 0;
    fpsTimer = 0;
  }

  requestAnimationFrame(animate);
};

fitCameraToObject(camera, controls, headGroup, 1.35);
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  fitCameraToObject(camera, controls, headGroup, 1.35);
});
