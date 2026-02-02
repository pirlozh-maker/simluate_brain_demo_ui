import * as THREE from 'three';

export const fitCameraToObject = (
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
  object: THREE.Object3D,
  margin = 1.25
) => {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere());

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const radius = sphere.radius;
  const distance = (radius / Math.sin(fov / 2)) * margin;

  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  const center = sphere.center.clone();
  camera.position.copy(center.clone().add(new THREE.Vector3(0, radius * 0.2, distance)));
  controls.target.copy(center);
  controls.update();
};
