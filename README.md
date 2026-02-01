# Digital Twin Neuro Demo (Three.js + TypeScript)

A lightweight Vite + Three.js demo showing a humanoid digital twin with animated walking, 53 MoCap markers, EEG 64 electrodes, EMG 8 sensors, and a simulated amplifier box. All signals are simulated locally (no backend).

## Quick Start

```bash
npm i
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Project Structure

```
src/
  scene/      # 3D scene & rigs
  signal/     # EEG/EMG simulation + montage data
  ui/         # HUD, controls, waveform panel
  assets/     # optional assets (GLB, textures)
```

## Interaction

- **OrbitControls**: drag to rotate, scroll to zoom, right-drag to pan.
- **Click EEG electrode**: highlights electrode, shows label, and updates waveform.
- **Click EMG sensor**: highlights EMG channel and updates waveform.
- **Panel**: play/pause, speed (0.5×/1×/2×), toggle EEG labels, toggle 53 markers, camera presets.

## Replace Humanoid GLB (Optional)

The current humanoid is a procedural rig so the demo can run without external assets. To replace it with a skinned GLB:

1. Drop the GLB into `src/assets/`.
2. Use `GLTFLoader` inside `SceneManager` (or a new `HumanoidRig` implementation) to load the model and drive `gaitPhase` from the animation mixer.
3. Keep the `HumanoidJoints` interface by mapping GLB bones (head, shoulders, elbows, wrists, hips, knees, ankles, toes) to marker and sensor rigs.

> Tip: When no GLB is available, the fallback rig still supports 53 markers, EEG/EMG overlays, and UI interactions.

## Connect Real Data Later

- **EEG**: replace `SignalBus.step()` with real signal ingestion. Keep `getSnapshot()` returning RMS/bandpower for visualization. See `src/signal/SignalBus.ts`.
- **EMG**: replace envelope generation with actual EMG rectified/envelope values. See `src/signal/SignalBus.ts`.
- **MoCap**: `MarkerRig` can be extended to read per-frame 53×3 data. The current structure isolates marker definitions so you can swap the update path.

## Self-Test Checklist

- [ ] 页面进入后，走路动画自动播放
- [ ] OrbitControls 正常（旋转、缩放、平移）
- [ ] 点击电极后显示 label 与波形
- [ ] EEG/EMG 信号持续变化，并与步态弱同步
- [ ] 53 个 markers 可切换显示，且随动画运动
