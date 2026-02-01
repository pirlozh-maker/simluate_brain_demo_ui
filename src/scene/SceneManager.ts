import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { HumanoidRig } from './HumanoidRig';
import { MarkerRig } from './MarkerRig';
import { ElectrodeRig } from './ElectrodeRig';
import { EmgRig } from './EmgRig';
import { AmplifierRig } from './AmplifierRig';
import { CableRig } from './CableRig';
import type { SignalSnapshot } from '../signal/SignalBus';

export class SceneManager {
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  controls: OrbitControls;

  humanoid: HumanoidRig;
  markers: MarkerRig;
  electrodes: ElectrodeRig;
  emg: EmgRig;
  amplifier: AmplifierRig;
  cables: CableRig;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  hovered?: THREE.Object3D;

  fps = 0;
  private frameCount = 0;
  private lastFpsTime = 0;

  constructor(private container: HTMLElement) {
    this.scene.background = new THREE.Color(0x0b0f17);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 50);
    this.camera.position.set(1.2, 1.4, 2.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1.1, 0);

    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(this.labelRenderer.domElement);

    this.addLights();
    this.addFloor();

    this.humanoid = new HumanoidRig();
    this.scene.add(this.humanoid.group);

    this.markers = new MarkerRig(this.humanoid.joints);
    this.scene.add(this.markers.group);

    this.electrodes = new ElectrodeRig();
    this.humanoid.joints.head.add(this.electrodes.group);

    this.emg = new EmgRig(this.humanoid.joints);

    this.amplifier = new AmplifierRig();
    this.scene.add(this.amplifier.group);

    this.cables = new CableRig();
    this.scene.add(this.cables.group);
    this.cables.addCable(this.electrodes.group, this.amplifier.group, 0x5ea1ff);
    this.cables.addCable(this.humanoid.joints.leftAnkle, this.amplifier.group, 0xff8c3b);
    this.cables.addCable(this.humanoid.joints.rightAnkle, this.amplifier.group, 0xff8c3b);

    this.addEventListeners();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(delta: number, snapshot: SignalSnapshot, showLabels: boolean) {
    this.markers.update();
    this.electrodes.updateEnergies(snapshot.eegRms);
    this.emg.updateEnvelope(snapshot.emgEnvelope);
    this.amplifier.update(snapshot.eegRms, snapshot.emgEnvelope);
    this.cables.update(delta);

    const cameraDistance = this.camera.position.distanceTo(this.humanoid.joints.head.getWorldPosition(new THREE.Vector3()));
    this.electrodes.updateLabels(showLabels, cameraDistance);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);

    this.updateFps(delta);
  }

  handlePointerMove(event: PointerEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  pick(): THREE.Object3D | undefined {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([
      ...this.electrodes.electrodes.map((e) => e.mesh),
      ...this.emg.sensors.map((s) => s.mesh),
    ]);
    return hits[0]?.object;
  }

  setMarkerVisibility(visible: boolean) {
    this.markers.setVisible(visible);
  }

  focusCamera(position: THREE.Vector3, target: THREE.Vector3) {
    this.camera.position.copy(position);
    this.controls.target.copy(target);
  }

  private addLights() {
    const ambient = new THREE.AmbientLight(0x3b4a6b, 0.6);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 3, 2);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x6da3ff, 0.7);
    fill.position.set(-2, 1, -1);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x88ffd2, 0.5);
    rim.position.set(0, 2, -3);
    this.scene.add(rim);
  }

  private addFloor() {
    const geometry = new THREE.CircleGeometry(2.2, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);
  }

  private addEventListeners() {
    window.addEventListener('resize', () => this.resize());
  }

  private updateFps(delta: number) {
    this.frameCount += 1;
    this.lastFpsTime += delta;
    if (this.lastFpsTime >= 1) {
      this.fps = Math.round(this.frameCount / this.lastFpsTime);
      this.frameCount = 0;
      this.lastFpsTime = 0;
    }
  }
}
