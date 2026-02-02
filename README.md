# 3D EEG 64-Channel Scalp Topomap Demo (Three.js + Vite)

A Three.js + TypeScript demo that renders a translucent 3D head/scalp and a real-time 64-channel EEG topomap. The heatmap is computed in a fragment shader using Gaussian/RBF interpolation across the scalp surface (no external models or network assets required).

## Quick Start

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Features

- OrbitControls for rotate/pan/zoom.
- Procedural head/scalp (ellipsoid + simple nose).
- 64 electrodes following the 10-10/10-20 naming convention.
- Continuous scalp topomap computed on GPU with Gaussian kernels.
- Diverging colormap + vertical colorbar overlay.
- Hover to inspect electrode name and current µV value.
- Modes: single hotspot, dual hotspot, random burst.

## Project Structure

```
src/
  eeg64.ts            # 64 electrode list (names + approximate scalp coords)
  colormap.ts         # color stops + gradient helper
  topomapMaterial.ts  # shader material for continuous topomap
  brainProcedural.ts  # procedural brain mesh with gyri/sulci noise
  fitCamera.ts        # fit-to-object camera helper
  main.ts             # scene setup, simulation, UI
  style.css           # minimal UI styles
```

## Topomap Algorithm

The fragment shader interpolates scalp values using a Gaussian (RBF) kernel:

```
w_i = exp(-d^2 / (2 * sigma^2))
value = sum(w_i * v_i) / sum(w_i)
```

- `d` is the 3D distance between a fragment on the scalp surface and each electrode position.
- `sigma` controls smoothness (slider in the UI).
- `v_i` are the simulated EEG values for each electrode.

This produces a continuous, smoothly varying map across the head surface.

## Parameters

- **Sigma**: interpolation smoothness on the scalp.
- **Amplitude**: peak µV range used for the color scale.
- **Mode**: single hotspot / dual hotspot / random burst.
- **Labels**: toggle electrode name overlays.

## Local Models (Optional)

If `public/assets/brain.glb` or `public/assets/head.glb` exists, the demo will load them. Otherwise it falls back to the procedural brain mesh.

## Swap in Real EEG Data

Replace the `updateSimulation()` logic in `src/main.ts` with live device data:

1. Parse incoming values (64 floats in µV).
2. Update the `values` array.
3. Call `topomapMaterial.uniformsNeedUpdate = true;` after each update.
