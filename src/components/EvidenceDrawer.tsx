import { useUiStore } from '../store/useUiStore';
import { usePipelineStore } from '../store/usePipelineStore';

const EvidenceDrawer = () => {
  const isOpen = useUiStore((state) => state.isEvidenceOpen);
  const evidenceFocus = useUiStore((state) => state.evidenceFocus);
  const toggleEvidence = useUiStore((state) => state.toggleEvidence);
  const rootCause = usePipelineStore((state) => state.rootCause);

  if (!isOpen) return null;

  return (
    <aside className="evidence-drawer">
      <div className="evidence-header">
        <div>
          <strong>Evidence</strong>
          <span>{evidenceFocus}</span>
        </div>
        <button className="close-btn" onClick={() => toggleEvidence(false)}>
          ✕
        </button>
      </div>
      <div className="evidence-body">
        <div className="evidence-card">
          <h4>Root Cause</h4>
          <p>{rootCause ?? 'Stable. No anomaly detected.'}</p>
          {rootCause && <button className="action-btn">One-click Fix</button>}
        </div>
        <div className="evidence-card">
          <h4>Signals</h4>
          <p>EEG line noise variance: 2.1σ</p>
          <p>Latency skew: 14ms</p>
          <p>Contact mapping drift: 0.08</p>
        </div>
        <div className="evidence-card">
          <h4>Playback</h4>
          <p>Saved 60s replay buffer · 10 checkpoints</p>
        </div>
      </div>
    </aside>
  );
};

export default EvidenceDrawer;
