import TwinStage from '../../components/TwinStage';
import LoopRing from '../../components/LoopRing';
import TelemetryStrip from '../../components/TelemetryStrip';
import EvidenceDrawer from '../../components/EvidenceDrawer';
import CopilotConsole from '../../components/CopilotConsole';
import MetricsHud from '../../components/MetricsHud';
import OverlayToggles from '../../components/OverlayToggles';
import TimeAxis from '../../components/TimeAxis';
import BatchQueue from '../../components/BatchQueue';
import { useUiStore } from '../../store/useUiStore';

const Cockpit = () => {
  const setEvidenceFocus = useUiStore((state) => state.setEvidenceFocus);

  return (
    <div className="page cockpit">
      <div className="cockpit-grid">
        <section className="dock left">
          <div className="panel">
            <h3>Devices & Quality</h3>
            {['EEG', 'EMG', 'MoCap', 'Force', 'IMU'].map((item) => (
              <div key={item} className="device-row">
                <span>{item}</span>
                <div className="status-pill success">Synced</div>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>Assets</h3>
            {['montage', 'leadfield', 'body model'].map((asset) => (
              <button
                key={asset}
                className="list-btn"
                onClick={() => setEvidenceFocus(`Asset: ${asset}`)}
              >
                {asset}
              </button>
            ))}
          </div>
        </section>

        <section className="center-hero">
          <TimeAxis />
          <OverlayToggles />
          <TwinStage />
          <MetricsHud />
        </section>

        <section className="dock right">
          <CopilotConsole />
          <LoopRing />
          <div className="panel">
            <h3>Evidence Focus</h3>
            <p className="muted">Tap any stage segment or asset to open evidence.</p>
            <button className="action-btn" onClick={() => setEvidenceFocus('QA Gate')}>
              QA Gate Evidence
            </button>
          </div>
        </section>

        <section className="bottom-strip">
          <TelemetryStrip />
          <BatchQueue />
          <div className="alerts">
            <div className="alerts-title">Alerts</div>
            <div className="alert-tags">
              {['sync_drift', 'eeg_line_noise', 'contact_model_mismatch'].map((tag) => (
                <button
                  key={tag}
                  className="tag"
                  onClick={() => setEvidenceFocus(`Alert: ${tag}`)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <EvidenceDrawer />
    </div>
  );
};

export default Cockpit;
