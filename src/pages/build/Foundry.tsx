import { useState } from 'react';
import { useBatchStore } from '../../store/useBatchStore';
import { usePipelineStore } from '../../store/usePipelineStore';
import { useUiStore } from '../../store/useUiStore';

const scenarios = ['gait', 'fatigue', 'artifacts', 'erp', 'ssvep', 'motor_imagery'];

const Foundry = () => {
  const [activeScenario, setActiveScenario] = useState(scenarios[0]);
  const addBatch = useBatchStore((state) => state.addBatch);
  const setEvidenceFocus = useUiStore((state) => state.setEvidenceFocus);
  const rootCause = usePipelineStore((state) => state.rootCause);

  return (
    <div className="page foundry">
      <div className="foundry-layout">
        <aside className="panel">
          <h3>Scenario Library</h3>
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              className={`list-btn ${activeScenario === scenario ? 'active' : ''}`}
              onClick={() => setActiveScenario(scenario)}
            >
              {scenario}
            </button>
          ))}
        </aside>
        <section className="foundry-center">
          <div className="panel stage-preview">
            <div className="panel-header">
              <h3>Stage Preview</h3>
              <button className="action-btn" onClick={() => addBatch()}>
                Create Batch
              </button>
            </div>
            <div className="preview-strip">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="preview-card">
                  <div className="wave" />
                  <div className="preview-meta">Sample {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="factory-line">
            {[
              'Reality Fit',
              'Generate',
              'QA Gate',
              'Export',
            ].map((item) => (
              <div key={item} className="factory-card" onClick={() => setEvidenceFocus(item)}>
                <strong>{item}</strong>
                <p>Auto-checks + replay build</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="panel">
          <h3>Reality Dashboard</h3>
          <div className="metric-row">
            <span>Reality Score</span>
            <strong>88</strong>
          </div>
          <div className="metric-row">
            <span>Gap</span>
            <strong>0.12</strong>
          </div>
          <div className="metric-row">
            <span>Coverage</span>
            <strong>0.84</strong>
          </div>
          <div className="metric-row">
            <span>Root Cause</span>
            <strong>{rootCause ?? 'stable'}</strong>
          </div>
          <button className="action-btn" onClick={() => setEvidenceFocus('QA Gate')}>
            View QA Gate
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Foundry;
