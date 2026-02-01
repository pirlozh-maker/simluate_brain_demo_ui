import './style.css';
import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager';
import { SignalBus } from './signal/SignalBus';
import { UiController } from './ui/UiController';

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app');

const sceneManager = new SceneManager(app);
const signalBus = new SignalBus();
const ui = new UiController(app);

let isPlaying = true;
let speed = 1;

const updateSelection = (object?: THREE.Object3D) => {
  if (!object) return;
  if (object.name.startsWith('EEG:')) {
    const name = object.name.replace('EEG:', '');
    sceneManager.electrodes.setSelected(name);
    sceneManager.emg.setSelected(undefined);
    ui.state.selectedChannel = `EEG ${name}`;
  } else if (object.name.startsWith('EMG:')) {
    const name = object.name.replace('EMG:', '');
    sceneManager.emg.setSelected(name);
    sceneManager.electrodes.setSelected(undefined);
    ui.state.selectedChannel = `EMG ${name}`;
  }
};

ui.onTogglePlay = (playing) => {
  isPlaying = playing;
};
ui.onSpeedChange = (newSpeed) => {
  speed = newSpeed;
};
ui.onToggleLabels = (show) => {
  ui.state.showLabels = show;
};
ui.onToggleMarkers = (show) => {
  sceneManager.setMarkerVisibility(show);
};
ui.onCameraPreset = (preset) => {
  const target = sceneManager.humanoid.joints.root.getWorldPosition(new THREE.Vector3());
  if (preset === 'head') {
    sceneManager.focusCamera(new THREE.Vector3(0.2, 1.5, 0.6), sceneManager.humanoid.joints.head.getWorldPosition(new THREE.Vector3()));
  } else if (preset === 'side') {
    sceneManager.focusCamera(new THREE.Vector3(2.2, 1.2, 0), target);
  } else {
    sceneManager.focusCamera(new THREE.Vector3(1.2, 1.4, 2.2), target);
  }
};

window.addEventListener('pointermove', (event) => sceneManager.handlePointerMove(event));
window.addEventListener('click', () => {
  const hit = sceneManager.pick();
  if (hit) updateSelection(hit);
});

let lastTime = performance.now();
const animate = (time: number) => {
  const delta = (time - lastTime) / 1000;
  lastTime = time;
  if (isPlaying) {
    sceneManager.humanoid.update(delta, speed);
    signalBus.setGaitPhase(sceneManager.humanoid.gaitPhase);
    signalBus.step(delta, speed);
  }
  const snapshot = signalBus.getSnapshot();
  sceneManager.update(delta, snapshot, ui.state.showLabels);

  if (ui.state.selectedChannel.startsWith('EEG')) {
    const index = sceneManager.electrodes.electrodes.findIndex(
      (electrode) => `EEG ${electrode.name}` === ui.state.selectedChannel
    );
    if (index >= 0) {
      ui.waveform.draw(signalBus.getWaveform('eeg', index), '#6fd3ff');
    }
  } else if (ui.state.selectedChannel.startsWith('EMG')) {
    const index = sceneManager.emg.sensors.findIndex(
      (sensor) => `EMG ${sensor.name}` === ui.state.selectedChannel
    );
    if (index >= 0) {
      ui.waveform.draw(signalBus.getWaveform('emg', index), '#ffb066');
    }
  } else {
    ui.waveform.draw(signalBus.getWaveform('eeg', 0), '#6fd3ff');
  }

  ui.state.fps = sceneManager.fps;
  ui.updateStatus();

  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
