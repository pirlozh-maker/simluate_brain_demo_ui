import * as THREE from 'three';
import type { HumanoidJoints } from './HumanoidRig';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export interface EmgSensor {
  name: string;
  mesh: THREE.Mesh;
  label: CSS2DObject;
}

const EMG_NAMES = ['L_TA', 'L_GM', 'L_GL', 'L_SOL', 'R_TA', 'R_GM', 'R_GL', 'R_SOL'];

export class EmgRig {
  group = new THREE.Group();
  sensors: EmgSensor[] = [];
  selected?: EmgSensor;

  constructor(joints: HumanoidJoints) {
    this.group.name = 'emg-sensors';
    this.createSensors(joints);
  }

  setSelected(name?: string) {
    this.selected = this.sensors.find((sensor) => sensor.name === name);
    this.sensors.forEach((sensor) => {
      const material = sensor.mesh.material as THREE.MeshStandardMaterial;
      const isSelected = sensor === this.selected;
      material.emissiveIntensity = isSelected ? 1.4 : 0.6;
      sensor.label.element.style.display = isSelected ? 'block' : 'none';
    });
  }

  updateEnvelope(envelopes: number[]) {
    this.sensors.forEach((sensor, index) => {
      const value = envelopes[index] ?? 0;
      const normalized = Math.min(1, value * 1.2);
      const material = sensor.mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + normalized * 1.5;
      material.color.setHSL(0.05, 0.8, 0.4 + normalized * 0.4);
      sensor.mesh.scale.setScalar(0.9 + normalized * 0.5);
    });
  }

  private createSensors(joints: HumanoidJoints) {
    const geometry = new THREE.SphereGeometry(0.018, 14, 14);
    const leftOffsets = [
      new THREE.Vector3(-0.05, -0.08, 0.08),
      new THREE.Vector3(-0.03, -0.12, 0.03),
      new THREE.Vector3(-0.04, -0.18, -0.02),
      new THREE.Vector3(-0.02, -0.25, -0.05),
    ];
    const rightOffsets = leftOffsets.map((offset) => new THREE.Vector3(-offset.x, offset.y, offset.z));
    const anchors = [
      joints.leftKnee,
      joints.leftKnee,
      joints.leftKnee,
      joints.leftAnkle,
      joints.rightKnee,
      joints.rightKnee,
      joints.rightKnee,
      joints.rightAnkle,
    ];

    EMG_NAMES.forEach((name, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff8c3b,
        emissive: 0x401400,
        emissiveIntensity: 0.6,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const offset = index < 4 ? leftOffsets[index] : rightOffsets[index - 4];
      mesh.position.copy(offset);
      mesh.name = `EMG:${name}`;
      anchors[index].add(mesh);

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = name;
      const labelObject = new CSS2DObject(label);
      labelObject.position.copy(offset).add(new THREE.Vector3(0, 0.03, 0));
      labelObject.element.style.display = 'none';
      anchors[index].add(labelObject);

      this.sensors.push({ name, mesh, label: labelObject });
    });
  }
}
