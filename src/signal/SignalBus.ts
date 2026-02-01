export interface SignalSnapshot {
  eegRms: number[];
  emgEnvelope: number[];
}

const EEG_CHANNELS = 64;
const EMG_CHANNELS = 8;

const EEG_SAMPLE_RATE = 250;
const EMG_SAMPLE_RATE = 1000;

const HISTORY_LENGTH = 512;

const createHistory = (channels: number) =>
  Array.from({ length: channels }, () => new Array(HISTORY_LENGTH).fill(0));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export class SignalBus {
  private eegHistory = createHistory(EEG_CHANNELS);
  private emgHistory = createHistory(EMG_CHANNELS);
  private eegIndex = 0;
  private emgIndex = 0;
  private time = 0;
  private gaitPhase = 0;

  private eegBaseFreqs = Array.from({ length: EEG_CHANNELS }, (_, i) => 6 + (i % 10) * 0.9);
  private eegSpikeTimers = Array.from({ length: EEG_CHANNELS }, () => 0);

  private emgPhaseOffsets = [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5];

  setGaitPhase(phase: number) {
    this.gaitPhase = phase;
  }

  step(dt: number, speed: number) {
    // Replace this generator with real EEG/EMG ingestion if available.
    const eegSamples = Math.max(1, Math.floor(dt * EEG_SAMPLE_RATE * speed));
    const emgSamples = Math.max(1, Math.floor(dt * EMG_SAMPLE_RATE * speed));
    const dtEeg = 1 / EEG_SAMPLE_RATE;
    const dtEmg = 1 / EMG_SAMPLE_RATE;

    for (let i = 0; i < eegSamples; i += 1) {
      this.time += dtEeg;
      this.eegIndex = (this.eegIndex + 1) % HISTORY_LENGTH;
      for (let ch = 0; ch < EEG_CHANNELS; ch += 1) {
        const freq = this.eegBaseFreqs[ch];
        const oscillation =
          Math.sin(2 * Math.PI * freq * this.time) * 0.6 +
          Math.sin(2 * Math.PI * (freq * 0.5) * this.time + ch) * 0.4;
        const noise = (Math.random() - 0.5) * 0.8;
        const spike = this.consumeSpike(ch);
        const value = oscillation + noise + spike;
        this.eegHistory[ch][this.eegIndex] = value;
      }
      this.triggerRandomSpike();
    }

    for (let i = 0; i < emgSamples; i += 1) {
      this.emgIndex = (this.emgIndex + 1) % HISTORY_LENGTH;
      const localTime = this.time + i * dtEmg;
      for (let ch = 0; ch < EMG_CHANNELS; ch += 1) {
        const phase = (this.gaitPhase + this.emgPhaseOffsets[ch]) % 1;
        const burst = this.gaitEnvelope(phase);
        const carrier = Math.sin(2 * Math.PI * (40 + ch * 4) * localTime) * 0.4;
        const noise = (Math.random() - 0.5) * 0.3;
        this.emgHistory[ch][this.emgIndex] = (carrier + noise) * burst;
      }
    }
  }

  getSnapshot(): SignalSnapshot {
    const eegRms = this.eegHistory.map((history) => this.computeRms(history, this.eegIndex));
    const emgEnvelope = this.emgHistory.map((history) => this.computeEnvelope(history, this.emgIndex));
    return { eegRms, emgEnvelope };
  }

  getWaveform(type: 'eeg' | 'emg', channel: number, length = 256): number[] {
    const source = type === 'eeg' ? this.eegHistory[channel] : this.emgHistory[channel];
    const index = type === 'eeg' ? this.eegIndex : this.emgIndex;
    const data = [] as number[];
    for (let i = 0; i < length; i += 1) {
      const idx = (index - i + HISTORY_LENGTH) % HISTORY_LENGTH;
      data.push(source[idx]);
    }
    return data.reverse();
  }

  private computeRms(history: number[], index: number, windowMs = 200) {
    const window = Math.min(HISTORY_LENGTH, Math.floor((windowMs / 1000) * EEG_SAMPLE_RATE));
    let sum = 0;
    for (let i = 0; i < window; i += 1) {
      const idx = (index - i + HISTORY_LENGTH) % HISTORY_LENGTH;
      sum += history[idx] ** 2;
    }
    return Math.sqrt(sum / window);
  }

  private computeEnvelope(history: number[], index: number, windowMs = 80) {
    const window = Math.min(HISTORY_LENGTH, Math.floor((windowMs / 1000) * EMG_SAMPLE_RATE));
    let sum = 0;
    for (let i = 0; i < window; i += 1) {
      const idx = (index - i + HISTORY_LENGTH) % HISTORY_LENGTH;
      sum += Math.abs(history[idx]);
    }
    return sum / window;
  }

  private gaitEnvelope(phase: number) {
    const swing = Math.sin(Math.PI * phase);
    const burst = Math.exp(-Math.pow((phase - 0.15) * 7, 2)) + Math.exp(-Math.pow((phase - 0.65) * 8, 2));
    return clamp(0.15 + 0.5 * swing + 1.8 * burst, 0.1, 2.5);
  }

  private triggerRandomSpike() {
    if (Math.random() < 0.08) {
      const channel = Math.floor(Math.random() * EEG_CHANNELS);
      this.eegSpikeTimers[channel] = 6 + Math.random() * 4;
    }
  }

  private consumeSpike(channel: number) {
    const timer = this.eegSpikeTimers[channel];
    if (timer <= 0) return 0;
    this.eegSpikeTimers[channel] = timer - 1;
    return 3 * Math.sin((timer / 10) * Math.PI);
  }
}
