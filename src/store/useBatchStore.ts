import { create } from 'zustand';
import { BatchConfig, createBatchConfig } from '../mock/generators';

type BatchItem = {
  id: string;
  config: BatchConfig;
  status: 'queued' | 'running' | 'done' | 'failed';
  createdAt: number;
};

type BatchState = {
  batches: BatchItem[];
  addBatch: (config?: BatchConfig) => BatchItem;
  updateBatchStatus: (id: string, status: BatchItem['status']) => void;
};

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  addBatch: (config = createBatchConfig()) => {
    const batch: BatchItem = {
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      config,
      status: 'queued',
      createdAt: Date.now(),
    };
    set((state) => ({ batches: [batch, ...state.batches].slice(0, 6) }));
    return batch;
  },
  updateBatchStatus: (id, status) =>
    set({
      batches: get().batches.map((batch) =>
        batch.id === id ? { ...batch, status } : batch,
      ),
    }),
}));
