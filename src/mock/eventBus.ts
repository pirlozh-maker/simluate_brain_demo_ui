import { useTelemetryStore } from '../store/useTelemetryStore';
import { useTwinStore } from '../store/useTwinStore';
import { useUiStore } from '../store/useUiStore';
import { randomCovariance, randomHeat, randomVectors } from './generators';

type TwinEvent = {
  timestamp: number;
  posture: [number, number, number];
  phase: number;
  eegHeat: number[];
  emgHeat: number[];
  forceVectors: { x: number; y: number }[];
  residual: number;
  covariance: number[];
};

let started = false;
let telemetryTimer: number | null = null;
let twinTimer: number | null = null;
let replayTimer: number | null = null;
const buffer: TwinEvent[] = [];

const pushBuffer = (event: TwinEvent) => {
  buffer.push(event);
  if (buffer.length > 60) {
    buffer.shift();
  }
};

const createTwinEvent = (phase: number): TwinEvent => ({
  timestamp: Date.now(),
  posture: [Math.sin(phase) * 0.4, Math.cos(phase) * 0.2, Math.sin(phase * 0.7) * 0.2],
  phase,
  eegHeat: randomHeat(16, 0.2),
  emgHeat: randomHeat(16, 0.15),
  forceVectors: randomVectors(6),
  residual: 0.15 + Math.random() * 0.3,
  covariance: randomCovariance(12),
});

const startReplay = () => {
  let index = 0;
  if (replayTimer) window.clearInterval(replayTimer);
  replayTimer = window.setInterval(() => {
    if (!buffer.length) return;
    const event = buffer[index % buffer.length];
    useTwinStore.getState().setTwinState({
      posture: event.posture,
      phase: event.phase,
      eegHeat: event.eegHeat,
      emgHeat: event.emgHeat,
      forceVectors: event.forceVectors,
      residual: event.residual,
      covariance: event.covariance,
    });
    index += 1;
    if (index >= buffer.length) {
      useUiStore.getState().setPlaybackMode('live');
    }
  }, 600);
};

const stopReplay = () => {
  if (replayTimer) window.clearInterval(replayTimer);
  replayTimer = null;
};

export const startMockBus = () => {
  if (started) return () => undefined;
  started = true;
  let phase = 0;

  telemetryTimer = window.setInterval(() => {
    if (useUiStore.getState().playbackMode !== 'live') return;
    const { score } = useTelemetryStore.getState();
    const drift = (Math.random() - 0.5) * 0.04;
    const nextScore = Math.min(0.98, Math.max(0.5, score + drift));
    useTelemetryStore.getState().setTelemetry({
      quality: Math.min(0.98, Math.max(0.6, nextScore + 0.1)),
      latency: Math.round(28 + Math.random() * 18),
      dropout: Math.max(0.01, Math.random() * 0.06),
      score: nextScore,
      gap: Math.max(0.05, 1 - nextScore),
      coverage: Math.min(0.98, nextScore + 0.08),
      confidence: Math.min(0.95, nextScore + 0.05),
      phase: nextScore > 0.82 ? 'sync' : 'aligning',
    });
  }, 500);

  twinTimer = window.setInterval(() => {
    if (useUiStore.getState().playbackMode !== 'live') return;
    phase += 0.18;
    const event = createTwinEvent(phase);
    useTwinStore.getState().setTwinState(event);
    pushBuffer(event);
  }, 1000);

  const unsubscribe = useUiStore.subscribe((state) => state.playbackMode, (mode) => {
    if (mode === 'replay') {
      startReplay();
    } else {
      stopReplay();
    }
  });

  return () => {
    if (telemetryTimer) window.clearInterval(telemetryTimer);
    if (twinTimer) window.clearInterval(twinTimer);
    stopReplay();
    unsubscribe();
    started = false;
  };
};
