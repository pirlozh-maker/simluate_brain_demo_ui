import { WaveformPanel } from './WaveformPanel';

export interface UiState {
  isPlaying: boolean;
  speed: number;
  showLabels: boolean;
  showMarkers: boolean;
  selectedChannel: string;
  fps: number;
}

export class UiController {
  root: HTMLDivElement;
  waveform: WaveformPanel;
  state: UiState;

  onTogglePlay?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
  onToggleLabels?: (show: boolean) => void;
  onToggleMarkers?: (show: boolean) => void;
  onCameraPreset?: (preset: string) => void;

  private statusEl: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'ui-root';
    container.appendChild(this.root);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h1>Digital Twin Neuro Console</h1>
      <div class="row">
        <button data-action="toggle">Pause</button>
        <select data-action="speed">
          <option value="0.5">0.5×</option>
          <option value="1" selected>1×</option>
          <option value="2">2×</option>
        </select>
      </div>
      <div class="toggle-group">
        <label><input type="checkbox" data-action="labels" checked /> 显示/隐藏 EEG labels</label>
        <label><input type="checkbox" data-action="markers" checked /> 显示/隐藏 53 markers</label>
      </div>
      <div class="camera-buttons">
        <button data-action="camera" data-preset="full">Full Body</button>
        <button data-action="camera" data-preset="head">Head Focus</button>
        <button data-action="camera" data-preset="side">Side View</button>
      </div>
      <canvas class="waveform" data-role="waveform"></canvas>
      <div class="status" data-role="status"></div>
      <div class="footer-note">点击 EEG/EMG 点查看通道波形。</div>
    `;
    this.root.appendChild(panel);

    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML = `<div data-role="hud"></div>`;
    this.root.appendChild(hud);

    const waveformCanvas = panel.querySelector('[data-role="waveform"]') as HTMLCanvasElement;
    this.waveform = new WaveformPanel(waveformCanvas);
    this.statusEl = panel.querySelector('[data-role="status"]') as HTMLDivElement;

    this.state = {
      isPlaying: true,
      speed: 1,
      showLabels: true,
      showMarkers: true,
      selectedChannel: 'None',
      fps: 0,
    };

    this.bindEvents(panel);
  }

  updateStatus() {
    this.statusEl.textContent = `FPS: ${this.state.fps} | Selected: ${this.state.selectedChannel}`;
    const hud = this.root.querySelector('[data-role="hud"]') as HTMLDivElement;
    hud.textContent = `FPS ${this.state.fps}`;
  }

  private bindEvents(panel: HTMLElement) {
    panel.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' && target.dataset.action === 'toggle') {
        this.state.isPlaying = !this.state.isPlaying;
        target.textContent = this.state.isPlaying ? 'Pause' : 'Play';
        this.onTogglePlay?.(this.state.isPlaying);
      }
      if (target.tagName === 'BUTTON' && target.dataset.action === 'camera') {
        const preset = target.dataset.preset ?? 'full';
        this.onCameraPreset?.(preset);
      }
    });

    const speedSelect = panel.querySelector('[data-action="speed"]') as HTMLSelectElement;
    speedSelect.addEventListener('change', () => {
      this.state.speed = Number(speedSelect.value);
      this.onSpeedChange?.(this.state.speed);
    });

    const labelToggle = panel.querySelector('[data-action="labels"]') as HTMLInputElement;
    labelToggle.addEventListener('change', () => {
      this.state.showLabels = labelToggle.checked;
      this.onToggleLabels?.(this.state.showLabels);
    });

    const markerToggle = panel.querySelector('[data-action="markers"]') as HTMLInputElement;
    markerToggle.addEventListener('change', () => {
      this.state.showMarkers = markerToggle.checked;
      this.onToggleMarkers?.(this.state.showMarkers);
    });
  }
}
