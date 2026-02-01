import * as THREE from 'three';
import type { HumanoidJoints } from './HumanoidRig';

interface MarkerDefinition {
  anchor?: THREE.Object3D;
  offset?: THREE.Vector3;
  lerpA?: THREE.Object3D;
  lerpB?: THREE.Object3D;
  lerpAlpha?: number;
}

export class MarkerRig {
  group = new THREE.Group();
  markers: THREE.Mesh[] = [];
  visible = true;

  private definitions: MarkerDefinition[] = [];

  constructor(joints: HumanoidJoints) {
    this.group.name = 'markers';
    this.buildDefinitions(joints);
    this.createMarkers();
  }

  // To plug in real MoCap data later, bypass `buildDefinitions` and drive
  // marker positions directly from per-frame 53x3 coordinates.

  setVisible(visible: boolean) {
    this.visible = visible;
    this.group.visible = visible;
  }

  update() {
    this.definitions.forEach((definition, index) => {
      const marker = this.markers[index];
      if (!marker) return;
      if (definition.anchor) {
        marker.position.copy(definition.anchor.getWorldPosition(new THREE.Vector3()));
        if (definition.offset) {
          marker.position.add(definition.offset);
        }
      } else if (definition.lerpA && definition.lerpB) {
        const a = definition.lerpA.getWorldPosition(new THREE.Vector3());
        const b = definition.lerpB.getWorldPosition(new THREE.Vector3());
        marker.position.lerpVectors(a, b, definition.lerpAlpha ?? 0.5);
      }
    });
  }

  private buildDefinitions(joints: HumanoidJoints) {
    const offset = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const defs: MarkerDefinition[] = [
      { anchor: joints.head, offset: offset(0, 0.12, 0) },
      { anchor: joints.head, offset: offset(0.05, 0.05, 0.1) },
      { anchor: joints.head, offset: offset(-0.05, 0.05, 0.1) },
      { anchor: joints.neck, offset: offset(0, 0.04, 0) },
      { anchor: joints.chest, offset: offset(0, 0.1, 0.1) },
      { anchor: joints.chest, offset: offset(0.1, 0.08, 0) },
      { anchor: joints.chest, offset: offset(-0.1, 0.08, 0) },
      { anchor: joints.spine, offset: offset(0, 0.05, 0.12) },
      { anchor: joints.spine, offset: offset(0, 0.0, 0.1) },
      { anchor: joints.root, offset: offset(0.08, 0, 0.08) },
      { anchor: joints.root, offset: offset(-0.08, 0, 0.08) },
      { anchor: joints.leftShoulder, offset: offset(-0.05, -0.02, 0) },
      { anchor: joints.rightShoulder, offset: offset(0.05, -0.02, 0) },
      { anchor: joints.leftElbow, offset: offset(-0.04, -0.05, 0.02) },
      { anchor: joints.rightElbow, offset: offset(0.04, -0.05, 0.02) },
      { anchor: joints.leftWrist, offset: offset(-0.03, -0.04, 0.02) },
      { anchor: joints.rightWrist, offset: offset(0.03, -0.04, 0.02) },
      { anchor: joints.leftHip, offset: offset(-0.02, -0.05, 0.03) },
      { anchor: joints.rightHip, offset: offset(0.02, -0.05, 0.03) },
      { anchor: joints.leftKnee, offset: offset(-0.02, -0.08, 0.02) },
      { anchor: joints.rightKnee, offset: offset(0.02, -0.08, 0.02) },
      { anchor: joints.leftAnkle, offset: offset(-0.02, -0.05, 0.04) },
      { anchor: joints.rightAnkle, offset: offset(0.02, -0.05, 0.04) },
      { anchor: joints.leftToe, offset: offset(-0.01, -0.02, 0.1) },
      { anchor: joints.rightToe, offset: offset(0.01, -0.02, 0.1) },
    ];

    const limbPairs: Array<[THREE.Object3D, THREE.Object3D]> = [
      [joints.leftShoulder, joints.leftElbow],
      [joints.leftElbow, joints.leftWrist],
      [joints.rightShoulder, joints.rightElbow],
      [joints.rightElbow, joints.rightWrist],
      [joints.leftHip, joints.leftKnee],
      [joints.leftKnee, joints.leftAnkle],
      [joints.rightHip, joints.rightKnee],
      [joints.rightKnee, joints.rightAnkle],
    ];

    limbPairs.forEach(([a, b]) => {
      defs.push({ lerpA: a, lerpB: b, lerpAlpha: 0.33 });
      defs.push({ lerpA: a, lerpB: b, lerpAlpha: 0.66 });
    });

    while (defs.length < 53) {
      const anchor = defs.length % 2 === 0 ? joints.chest : joints.root;
      const spread = 0.08 + (defs.length % 6) * 0.01;
      defs.push({
        anchor,
        offset: offset(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ),
      });
    }

    this.definitions = defs.slice(0, 53);
  }

  private createMarkers() {
    const geometry = new THREE.SphereGeometry(0.015, 12, 12);
    const material = new THREE.MeshStandardMaterial({
      color: 0x38c4ff,
      emissive: 0x0b2a3f,
      emissiveIntensity: 0.7,
    });

    this.markers = this.definitions.map((_, index) => {
      const marker = new THREE.Mesh(geometry, material.clone());
      marker.name = `Marker${String(index + 1).padStart(2, '0')}`;
      this.group.add(marker);
      return marker;
    });
  }
}
