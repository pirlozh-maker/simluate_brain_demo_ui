import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EEG_64, degreesToRadians } from './eeg64';
import { buildGradient } from './colormap';
import { createTopomapMaterial } from './TopomapMaterial';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing #app element');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#06080f');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 1.4, 3.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.className = 'label-layer';
app.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(3, 4, 2);
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(8, 16, 0x1b2c45, 0x111820);
gridHelper.position.y = -0.2;
scene.add(gridHelper);

const headScale = new THREE.Vector3(1, 1.15, 1);
const headGeometry = new THREE.SphereGeometry(1, 128, 128);
headGeometry.scale(headScale.x, headScale.y, headScale.z);

const headMaterial = new THREE.MeshStandardMaterial({
  color: 0x9a8f86,
  roughness: 0.5,
  metalness: 0.05,
  transparent: true,
  opacity: 0.35,
});

const headMesh = new THREE.Mesh(headGeometry, headMaterial);
scene.add(headMesh);

const noseGeometry = new THREE.ConeGeometry(0.07, 0.2, 24);
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xb0a59d, roughness: 0.45 });
const noseMesh = new THREE.Mesh(noseGeometry, noseMaterial);
noseMesh.position.set(0, 1.08, 1.03);
noseMesh.rotation.x = Math.PI * 0.55;
scene.add(noseMesh);

const toVector = (lat: number, lon: number) => {
  const latRad = degreesToRadians(lat);
  const lonRad = degreesToRadians(lon);
  const cosLat = Math.cos(latRad);
  return new THREE.Vector3(cosLat * Math.sin(lonRad), Math.sin(latRad), cosLat * Math.cos(lonRad));
};

const electrodePositions: THREE.Vector3[] = [];
const electrodePositionsRaised: THREE.Vector3[] = [];

EEG_64.forEach((electrode) => {
  const base = toVector(electrode.lat, electrode.lon);
  const scaled = new THREE.Vector3(base.x * headScale.x, base.y * headScale.y, base.z * headScale.z);
  const normal = scaled.clone().normalize();
  electrodePositions.push(scaled);
  electrodePositionsRaised.push(scaled.clone().addScaledVector(normal, 0.025));
});

const values = new Float32Array(EEG_64.length);
const topomapMaterial = createTopomapMaterial(electrodePositions, values, 0.35, -20, 20);
const topomapMesh = new THREE.Mesh(headGeometry, topomapMaterial);
topomapMesh.renderOrder = 2;
scene.add(topomapMesh);

const electrodeGeometry = new THREE.SphereGeometry(0.028, 18, 18);
const electrodeMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, color: 0x111111 });
const electrodesMesh = new THREE.InstancedMesh(electrodeGeometry, electrodeMaterial, EEG_64.length);
const electrodeColor = new THREE.Color(0x111111);
const highlightColor = new THREE.Color(0xfff2aa);
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
scene.add(electrodesMesh);

const labelGroup = new THREE.Group();
const labelObjects: CSS2DObject[] = [];

EEG_64.forEach((electrode, index) => {
  const div = document.createElement('div');
  div.className = 'electrode-label';
  div.textContent = electrode.name;
  const label = new CSS2DObject(div);
  label.position.copy(electrodePositionsRaised[index].clone().add(new THREE.Vector3(0, 0.02, 0)));
  label.visible = false;
  labelObjects.push(label);
  labelGroup.add(label);
});

scene.add(labelGroup);

const ui = document.createElement('div');
ui.className = 'ui';
ui.innerHTML = `
  <div class="panel">
    <h1>3D EEG 64 导热力图</h1>
    <div class="row">
      <label for="sigma">Sigma (平滑半径)</label>
      <input id="sigma" type="range" min="0.18" max="0.6" step="0.01" value="0.35" />
    </div>
    <div class="row">
      <label for="amplitude">Amplitude (µV)</label>
      <input id="amplitude" type="range" min="10" max="30" step="1" value="20" />
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
const modeSelect = ui.querySelector<HTMLSelectElement>('#mode');
const labelsToggle = ui.querySelector<HTMLInputElement>('#labels');
const gridToggle = ui.querySelector<HTMLInputElement>('#grid');
const hoverLabel = ui.querySelector<HTMLSpanElement>('#hover');
const fpsLabel = ui.querySelector<HTMLSpanElement>('#fps');
const tooltip = ui.querySelector<HTMLDivElement>('#tooltip');

const colorbarGradient = ui.querySelector<HTMLDivElement>('.colorbar-gradient');
if (colorbarGradient) {
  colorbarGradient.style.background = buildGradient();
}

let sigma = 0.35;
let amplitude = 20;
let mode: 'single' | 'dual' | 'random' = 'single';

sigmaInput?.addEventListener('input', (event) => {
  sigma = Number((event.target as HTMLInputElement).value);
  topomapMaterial.uniforms.sigma.value = sigma;
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

modeSelect?.addEventListener('change', (event) => {
  mode = (event.target as HTMLSelectElement).value as 'single' | 'dual' | 'random';
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
  randomState.position = toVector(lat, lon);
  randomState.start = time;
  randomState.strength = 0.5 + Math.random() * 0.9;
};

refreshRandomBurst(0);

const updateSimulation = (time: number) => {
  const t = time * 0.001;
  const hotspot1 = toVector(20 + 18 * Math.sin(t * 0.5), 40 * Math.sin(t * 0.3));
  const hotspot2 = toVector(-10 + 12 * Math.sin(t * 0.45 + 1.7), -60 + 35 * Math.cos(t * 0.25));
  const spread = 0.55;
  const phase = Math.sin(t * 1.4);

  if (mode === 'random' && t - randomState.start > randomState.duration) {
    refreshRandomBurst(t);
  }

  for (let i = 0; i < EEG_64.length; i += 1) {
    const position = electrodePositions[i];
    let field = 0;

    if (mode === 'single') {
      field = gaussianAngular(position, hotspot1, spread) * phase;
    } else if (mode === 'dual') {
      field =
        gaussianAngular(position, hotspot1, spread) * phase -
        gaussianAngular(position, hotspot2, spread) * Math.cos(t * 1.1);
    } else {
      const burstProgress = THREE.MathUtils.clamp((t - randomState.start) / randomState.duration, 0, 1);
      const burstEnvelope = Math.sin(Math.PI * burstProgress);
      field = gaussianAngular(position, randomState.position, 0.45) * burstEnvelope * randomState.strength;
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
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Replace updateSimulation() with real EEG data ingestion for live streams:
// - Update `values` from incoming device packets.
// - Call `topomapMaterial.uniformsNeedUpdate = true;` after updates.
