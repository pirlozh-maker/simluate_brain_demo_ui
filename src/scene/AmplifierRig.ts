import * as THREE from 'three';

const EEG_GROUPS = [
  { name: 'Frontal', start: 0, count: 16, color: 0x55d3ff },
  { name: 'Central', start: 16, count: 16, color: 0x6dffad },
  { name: 'Parietal', start: 32, count: 16, color: 0xffd55c },
  { name: 'Occipital', start: 48, count: 16, color: 0xff8bb3 },
];

export class AmplifierRig {
  group = new THREE.Group();
  eegLeds: THREE.Mesh[] = [];
  emgLeds: THREE.Mesh[] = [];

  constructor() {
    this.group.name = 'amplifier';
    this.group.position.set(0.8, 0.5, -0.4);
    this.createAmplifier();
  }

  update(eeg: number[], emg: number[]) {
    this.eegLeds.forEach((led, index) => {
      const value = Math.min(1, (eeg[index] ?? 0) / 2.2);
      const material = led.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + value * 1.5;
      material.color.setHSL(0.55, 0.9, 0.3 + value * 0.5);
    });

    this.emgLeds.forEach((led, index) => {
      const value = Math.min(1, (emg[index] ?? 0) * 1.2);
      const material = led.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.2 + value * 1.6;
      material.color.setHSL(0.05, 0.8, 0.3 + value * 0.5);
    });
  }

  private createAmplifier() {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.18, 0.25),
      new THREE.MeshStandardMaterial({
        color: 0x1e2536,
        roughness: 0.4,
        metalness: 0.2,
      })
    );
    box.position.set(0, 0.08, 0);
    this.group.add(box);

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.02, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0x0c111b,
        roughness: 0.8,
      })
    );
    panel.position.set(0, 0.18, 0);
    this.group.add(panel);

    const ledGeometry = new THREE.SphereGeometry(0.012, 10, 10);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x55d3ff,
      emissive: 0x0b2a3f,
      emissiveIntensity: 0.4,
    });

    EEG_GROUPS.forEach((group, groupIndex) => {
      for (let i = 0; i < group.count; i += 1) {
        const led = new THREE.Mesh(ledGeometry, baseMaterial.clone());
        const x = -0.18 + (i % 8) * 0.05;
        const z = -0.08 + Math.floor(i / 8) * 0.05 + groupIndex * 0.04;
        led.position.set(x, 0.19, z);
        this.group.add(led);
        this.eegLeds.push(led);
      }
    });

    const emgMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8c3b,
      emissive: 0x3a1200,
      emissiveIntensity: 0.4,
    });
    for (let i = 0; i < 8; i += 1) {
      const led = new THREE.Mesh(ledGeometry, emgMaterial.clone());
      led.position.set(-0.18 + i * 0.05, 0.19, 0.12);
      this.group.add(led);
      this.emgLeds.push(led);
    }
  }
}
