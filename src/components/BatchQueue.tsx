import { useBatchStore } from '../store/useBatchStore';

const BatchQueue = () => {
  const batches = useBatchStore((state) => state.batches);

  return (
    <div className="batch-queue">
      <div className="batch-title">Batch Queue</div>
      <div className="batch-list">
        {batches.length === 0 && <p className="muted">No queued batches.</p>}
        {batches.map((batch) => (
          <div key={batch.id} className={`batch-item ${batch.status}`}>
            <div>
              <strong>{batch.id}</strong>
              <span>{batch.config.scenario}</span>
            </div>
            <div>
              <span>{batch.config.versionId}</span>
              <span>{batch.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchQueue;
