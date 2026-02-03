import { create } from 'zustand';

export type Mode = 'BUILD' | 'LIVE';
export type PlaybackMode = 'live' | 'paused' | 'replay';

type UiState = {
  mode: Mode;
  playbackMode: PlaybackMode;
  isEvidenceOpen: boolean;
  evidenceFocus: string;
  overlay: {
    eeg: boolean;
    emg: boolean;
    force: boolean;
    phase: boolean;
  };
  setMode: (mode: Mode) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  toggleEvidence: (open?: boolean) => void;
  setEvidenceFocus: (focus: string) => void;
  toggleOverlay: (key: keyof UiState['overlay']) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mode: 'BUILD',
  playbackMode: 'live',
  isEvidenceOpen: false,
  evidenceFocus: 'Overview',
  overlay: {
    eeg: true,
    emg: false,
    force: false,
    phase: true,
  },
  setMode: (mode) => set({ mode }),
  setPlaybackMode: (playbackMode) => set({ playbackMode }),
  toggleEvidence: (open) =>
    set((state) => ({
      isEvidenceOpen: open ?? !state.isEvidenceOpen,
    })),
  setEvidenceFocus: (evidenceFocus) => set({ evidenceFocus, isEvidenceOpen: true }),
  toggleOverlay: (key) =>
    set((state) => ({
      overlay: { ...state.overlay, [key]: !state.overlay[key] },
    })),
}));
