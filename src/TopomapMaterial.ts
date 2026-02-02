import * as THREE from 'three';

export type TopomapUniforms = {
  electrodePositions: { value: THREE.Vector3[] };
  electrodeValues: { value: Float32Array };
  sigma: { value: number };
  minValue: { value: number };
  maxValue: { value: number };
};

export const createTopomapMaterial = (
  positions: THREE.Vector3[],
  values: Float32Array,
  sigma: number,
  minValue: number,
  maxValue: number
) => {
  const uniforms: TopomapUniforms = {
    electrodePositions: { value: positions },
    electrodeValues: { value: values },
    sigma: { value: sigma },
    minValue: { value: minValue },
    maxValue: { value: maxValue },
  };

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    defines: {
      ELECTRODE_COUNT: positions.length,
    },
    vertexShader: `
      varying vec3 vPosition;

      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 electrodePositions[ELECTRODE_COUNT];
      uniform float electrodeValues[ELECTRODE_COUNT];
      uniform float sigma;
      uniform float minValue;
      uniform float maxValue;

      varying vec3 vPosition;

      float gaussianWeight(float d, float s) {
        return exp(-(d * d) / (2.0 * s * s));
      }

      vec3 colormap(float t) {
        vec3 c1 = vec3(0.11, 0.19, 0.74);
        vec3 c2 = vec3(0.1, 0.72, 0.82);
        vec3 c3 = vec3(0.94, 0.84, 0.29);
        vec3 c4 = vec3(0.84, 0.13, 0.25);
        if (t < 0.33) {
          return mix(c1, c2, t / 0.33);
        }
        if (t < 0.66) {
          return mix(c2, c3, (t - 0.33) / 0.33);
        }
        return mix(c3, c4, (t - 0.66) / 0.34);
      }

      void main() {
        float weightedSum = 0.0;
        float weightTotal = 0.0;

        for (int i = 0; i < ELECTRODE_COUNT; i++) {
          float d = distance(vPosition, electrodePositions[i]);
          float w = gaussianWeight(d, sigma);
          weightedSum += w * electrodeValues[i];
          weightTotal += w;
        }

        float value = weightedSum / max(weightTotal, 0.00001);
        float t = clamp((value - minValue) / (maxValue - minValue), 0.0, 1.0);
        vec3 color = colormap(t);

        gl_FragColor = vec4(color, 0.85);
      }
    `,
  });
};
