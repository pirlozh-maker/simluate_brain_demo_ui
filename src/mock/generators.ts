export type RootCauseTag =
  | 'sync_drift'
  | 'mocap_dropout'
  | 'eeg_line_noise'
  | 'contact_model_mismatch'
  | 'imu_bias'
  | 'phase_aliasing';

export const rootCauseTags: RootCauseTag[] = [
  'sync_drift',
  'mocap_dropout',
  'eeg_line_noise',
  'contact_model_mismatch',
  'imu_bias',
  'phase_aliasing',
];

export const randomRootCause = () =>
  rootCauseTags[Math.floor(Math.random() * rootCauseTags.length)];

export const stageSequence = [
  'INGESTING',
  'CALIBRATING',
  'GENERATING',
  'QA_CHECKING',
  'BENCHMARKING',
  'READY_FOR_LIVE',
] as const;

export type BatchConfig = {
  scenario: string;
  seed: number;
  versionId: string;
  configHash: string;
  notes: string;
};

const scenarios = [
  'gait',
  'fatigue',
  'artifacts',
  'erp',
  'ssvep',
  'motor_imagery',
];

export const createBatchConfig = (): BatchConfig => ({
  scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
  seed: Math.floor(1000 + Math.random() * 9000),
  versionId: `v${Math.floor(100 + Math.random() * 900)}`,
  configHash: Math.random().toString(36).slice(2, 10).toUpperCase(),
  notes: 'Auto-generated from Copilot batch request.',
});

export const randomHeat = (length: number, base = 0.2) =>
  Array.from({ length }, () => base + Math.random() * 0.6);

export const randomVectors = (length: number) =>
  Array.from({ length }, () => ({
    x: -1 + Math.random() * 2,
    y: -1 + Math.random() * 2,
  }));

export const randomCovariance = (length: number) =>
  Array.from({ length }, () => Math.random());
