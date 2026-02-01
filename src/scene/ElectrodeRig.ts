import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EEG64_BIOSEMI_MM } from '../signal/eeg64_montage';

export interface Electrode {
  name: string;
  mesh: THREE.Mesh;
  label: CSS2DObject;
  pulse: THREE.Sprite;
}

const HEAD_RADIUS = 0.11;

const createPulseTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(80, 200, 255, 0.9)');
  gradient.addColorStop(0.4, 'rgba(80, 200, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(80, 200, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export class ElectrodeRig {
  group = new THREE.Group();
  electrodes: Electrode[] = [];
  selected?: Electrode;

  private pulseTexture = createPulseTexture();

  constructor() {
    this.group.name = 'eeg-electrodes';
    this.createHead();
    this.createElectrodes();
  }

  setSelected(name?: string) {
    this.selected = this.electrodes.find((electrode) => electrode.name === name);
    this.electrodes.forEach((electrode) => {
      const isSelected = electrode === this.selected;
      const material = electrode.mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isSelected ? 1.2 : 0.6;
      electrode.label.element.classList.toggle('selected', isSelected);
    });
  }

  updateEnergies(energies: number[]) {
    this.electrodes.forEach((electrode, index) => {
      const energy = energies[index] ?? 0;
      const normalized = Math.min(1, energy / 2.2);
      const material = electrode.mesh.material as THREE.MeshStandardMaterial;
      material.color.setHSL(0.55, 0.85, 0.4 + normalized * 0.4);
      material.emissiveIntensity = 0.4 + normalized * 1.2;
      electrode.pulse.material.opacity = 0.2 + normalized * 0.7;
      electrode.pulse.scale.setScalar(0.08 + normalized * 0.18);
    });
  }

  updateLabels(show: boolean, cameraDistance: number) {
    const showAll = show && cameraDistance < 1.2;
    this.electrodes.forEach((electrode) => {
      const isSelected = electrode === this.selected;
      electrode.label.element.style.display = showAll || isSelected ? 'block' : 'none';
    });
  }

  private createHead() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x2c3448,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_RADIUS, 32, 32), material);
    head.name = 'head-shell';
    this.group.add(head);
  }

  private createElectrodes() {
    const geometry = new THREE.SphereGeometry(0.012, 16, 16);
    EEG64_BIOSEMI_MM.forEach((entry) => {
      const position = new THREE.Vector3(entry.x_mm, entry.y_mm, entry.z_mm);
      position.normalize().multiplyScalar(HEAD_RADIUS + 0.006);
      const material = new THREE.MeshStandardMaterial({
        color: 0x61b3ff,
        emissive: 0x0d2b4f,
        emissiveIntensity: 0.6,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.name = `EEG:${entry.name}`;

      const pulseMaterial = new THREE.SpriteMaterial({
        map: this.pulseTexture,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      });
      const pulse = new THREE.Sprite(pulseMaterial);
      pulse.position.copy(position);
      pulse.scale.setScalar(0.08);

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = entry.name;
      const labelObject = new CSS2DObject(label);
      labelObject.position.copy(position).add(new THREE.Vector3(0, 0.02, 0));

      this.group.add(mesh, pulse, labelObject);
      this.electrodes.push({ name: entry.name, mesh, label: labelObject, pulse });
    });
  }
}
