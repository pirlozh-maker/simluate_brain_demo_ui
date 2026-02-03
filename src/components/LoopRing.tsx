import { usePipelineStore } from '../store/usePipelineStore';
import { useUiStore } from '../store/useUiStore';

const segments = [
  { key: 'INGESTING', label: 'Ingest' },
  { key: 'CALIBRATING', label: 'Calibrate' },
  { key: 'GENERATING', label: 'Generate' },
  { key: 'BENCHMARKING', label: 'Benchmark' },
];

const LoopRing = () => {
  const stage = usePipelineStore((state) => state.stage);
  const setEvidenceFocus = useUiStore((state) => state.setEvidenceFocus);

  return (
    <div className="loop-ring">
      <div className="loop-ring-title">Loop Ring</div>
      <div className="loop-ring-visual">
        {segments.map((segment) => (
          <button
            key={segment.key}
            className={`loop-segment ${stage === segment.key ? 'active' : ''}`}
            onClick={() => setEvidenceFocus(`${segment.label} Evidence`)}
          >
            <span>{segment.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoopRing;
