import { create } from 'zustand';
import { RootCauseTag, randomRootCause, stageSequence } from '../mock/generators';

export type PipelineStage =
  | 'IDLE'
  | 'INGESTING'
  | 'CALIBRATING'
  | 'GENERATING'
  | 'QA_CHECKING'
  | 'BENCHMARKING'
  | 'READY_FOR_LIVE';

type PipelineState = {
  stage: PipelineStage;
  isRunning: boolean;
  rootCause: RootCauseTag | null;
  qaPassStreak: number;
  versionId: string;
  configHash: string;
  seed: number;
  setStage: (stage: PipelineStage) => void;
  runPipeline: () => void;
  clearRootCause: () => void;
  bumpVersion: () => void;
};

const nextVersion = () => `v${Math.floor(100 + Math.random() * 900)}`;
const nextHash = () =>
  Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase();

export const usePipelineStore = create<PipelineState>((set, get) => ({
  stage: 'IDLE',
  isRunning: false,
  rootCause: null,
  qaPassStreak: 0,
  versionId: nextVersion(),
  configHash: nextHash(),
  seed: Math.floor(Math.random() * 10000),
  setStage: (stage) => set({ stage }),
  clearRootCause: () => set({ rootCause: null }),
  bumpVersion: () =>
    set({
      versionId: nextVersion(),
      configHash: nextHash(),
      seed: Math.floor(Math.random() * 10000),
    }),
  runPipeline: () => {
    if (get().isRunning) return;
    set({ isRunning: true, rootCause: null });
    const stages = [...stageSequence];
    let index = 0;

    const advance = () => {
      const stage = stages[index];
      set({ stage });
      if (stage === 'QA_CHECKING') {
        const failed = Math.random() < 0.25;
        if (failed) {
          set({
            rootCause: randomRootCause(),
            stage: 'IDLE',
            isRunning: false,
            qaPassStreak: 0,
          });
          return;
        }
      }
      if (stage === 'READY_FOR_LIVE') {
        set((state) => ({
          isRunning: false,
          qaPassStreak: state.qaPassStreak + 1,
        }));
        return;
      }
      index += 1;
      setTimeout(advance, 900);
    };

    advance();
  },
}));
