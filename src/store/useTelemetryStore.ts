import { create } from 'zustand';

export type TelemetryState = {
  quality: number;
  latency: number;
  dropout: number;
  score: number;
  gap: number;
  coverage: number;
  confidence: number;
  phase: string;
  lastUpdated: number;
  setTelemetry: (payload: Partial<TelemetryState>) => void;
};

export const useTelemetryStore = create<TelemetryState>((set) => ({
  quality: 0.82,
  latency: 38,
  dropout: 0.02,
  score: 0.74,
  gap: 0.18,
  coverage: 0.76,
  confidence: 0.71,
  phase: 'sync',
  lastUpdated: Date.now(),
  setTelemetry: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
      lastUpdated: Date.now(),
    })),
}));
