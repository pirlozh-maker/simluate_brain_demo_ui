import * as THREE from 'three';

type NoiseOptions = {
  octaves: number;
  persistence: number;
  lacunarity: number;
  strength: number;
};

const hash = (x: number, y: number, z: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const smoothStep = (t: number) => t * t * (3 - 2 * t);

const valueNoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;

  const u = smoothStep(xf);
  const v = smoothStep(yf);
  const w = smoothStep(zf);

  const n000 = hash(xi, yi, zi);
  const n100 = hash(xi + 1, yi, zi);
  const n010 = hash(xi, yi + 1, zi);
  const n110 = hash(xi + 1, yi + 1, zi);
  const n001 = hash(xi, yi, zi + 1);
  const n101 = hash(xi + 1, yi, zi + 1);
  const n011 = hash(xi, yi + 1, zi + 1);
  const n111 = hash(xi + 1, yi + 1, zi + 1);

  const x00 = lerp(n000, n100, u);
  const x10 = lerp(n010, n110, u);
  const x01 = lerp(n001, n101, u);
  const x11 = lerp(n011, n111, u);
  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  return lerp(y0, y1, w);
};

const fbm = (x: number, y: number, z: number, options: NoiseOptions) => {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let max = 0;
  for (let i = 0; i < options.octaves; i += 1) {
    sum += valueNoise(x * frequency, y * frequency, z * frequency) * amplitude;
    max += amplitude;
    amplitude *= options.persistence;
    frequency *= options.lacunarity;
  }
  return sum / max;
};

export type BrainMeshOptions = {
  radius?: number;
  segments?: number;
  strength?: number;
};

export const createProceduralBrain = (options: BrainMeshOptions = {}) => {
  const radius = options.radius ?? 0.9;
  const segments = options.segments ?? 160;
  const strength = options.strength ?? 0.12;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  const temp = new THREE.Vector3();

  const noiseSettings: NoiseOptions = {
    octaves: 5,
    persistence: 0.55,
    lacunarity: 2.1,
    strength,
  };

  for (let i = 0; i < position.count; i += 1) {
    temp.fromBufferAttribute(position, i);
    const n1 = fbm(temp.x * 1.4, temp.y * 1.2, temp.z * 1.6, noiseSettings);
    const n2 = fbm(temp.x * 3.2, temp.y * 2.8, temp.z * 3.0, noiseSettings);
    const ridge = Math.pow(Math.abs(n2 * 2 - 1), 1.6);
    const displacement = (n1 * 0.6 + ridge * 0.4 - 0.3) * noiseSettings.strength;
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    temp.addScaledVector(new THREE.Vector3(nx, ny, nz), displacement);
    position.setXYZ(i, temp.x, temp.y, temp.z);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xb3847b,
    roughness: 0.6,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'procedural-brain';
  mesh.scale.set(1.05, 1.15, 1.1);
  return mesh;
};
