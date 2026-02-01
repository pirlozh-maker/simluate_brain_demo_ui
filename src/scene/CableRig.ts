import * as THREE from 'three';

interface Cable {
  start: THREE.Object3D;
  end: THREE.Object3D;
  mesh: THREE.Mesh;
  controlPoints: THREE.Vector3[];
}

export class CableRig {
  group = new THREE.Group();
  private cables: Cable[] = [];
  private elapsed = 0;

  constructor() {
    this.group.name = 'cables';
  }

  addCable(start: THREE.Object3D, end: THREE.Object3D, color = 0x5e9cff) {
    const curve = new THREE.CatmullRomCurve3([start.position.clone(), end.position.clone()]);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.006, 8, false);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    const controlPoints = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    this.cables.push({ start, end, mesh, controlPoints });
  }

  update(delta: number) {
    this.elapsed += delta;
    if (this.elapsed < 0.06) return;
    this.elapsed = 0;

    this.cables.forEach((cable) => {
      const start = cable.start.getWorldPosition(new THREE.Vector3());
      const end = cable.end.getWorldPosition(new THREE.Vector3());
      const mid = start.clone().lerp(end, 0.5);
      mid.y += 0.15 + Math.sin(Date.now() * 0.001) * 0.02;
      mid.x += Math.sin(Date.now() * 0.0007) * 0.02;

      cable.controlPoints[0].copy(start);
      cable.controlPoints[1].copy(mid);
      cable.controlPoints[2].copy(end);

      const curve = new THREE.CatmullRomCurve3(cable.controlPoints);
      const newGeometry = new THREE.TubeGeometry(curve, 20, 0.006, 8, false);
      cable.mesh.geometry.dispose();
      cable.mesh.geometry = newGeometry;
    });
  }
}
