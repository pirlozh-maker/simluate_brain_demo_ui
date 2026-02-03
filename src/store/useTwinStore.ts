import { create } from 'zustand';

export type TwinState = {
  posture: [number, number, number];
  phase: number;
  eegHeat: number[];
  emgHeat: number[];
  forceVectors: { x: number; y: number }[];
  residual: number;
  covariance: number[];
  setTwinState: (payload: Partial<TwinState>) => void;
};

export const useTwinStore = create<TwinState>((set) => ({
  posture: [0, 0, 0],
  phase: 0,
  eegHeat: Array.from({ length: 16 }, () => 0.3),
  emgHeat: Array.from({ length: 16 }, () => 0.2),
  forceVectors: Array.from({ length: 6 }, () => ({ x: 0.2, y: 0.2 })),
  residual: 0.24,
  covariance: Array.from({ length: 12 }, () => 0.2),
  setTwinState: (payload) => set((state) => ({ ...state, ...payload })),
}));
