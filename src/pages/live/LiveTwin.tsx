import { useMemo } from 'react';
import TwinStage from '../../components/TwinStage';
import TelemetryStrip from '../../components/TelemetryStrip';
import MetricsHud from '../../components/MetricsHud';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { usePipelineStore } from '../../store/usePipelineStore';

const LiveTwin = () => {
  const telemetry = useTelemetryStore();
  const qaPassStreak = usePipelineStore((state) => state.qaPassStreak);
  const liveUnlocked = useMemo(
    () => telemetry.score > 0.82 && qaPassStreak >= 2,
    [telemetry.score, qaPassStreak],
  );

  return (
    <div className="page live">
      <div className="live-layout">
        <section className="panel live-hero">
          <div className="live-header">
            <h3>Live Twin</h3>
            {!liveUnlocked && <span className="status-pill warning">Demo/Replay Only</span>}
          </div>
          <TwinStage />
          <MetricsHud />
        </section>
        <aside className="panel">
          <h3>Live Health</h3>
          <TelemetryStrip />
          <div className="metric-row">
            <span>Lock condition</span>
            <strong>{liveUnlocked ? 'Cleared' : 'Pending'}</strong>
          </div>
          <p className="muted">Need score &gt; 82 and 2 QA passes.</p>
        </aside>
      </div>
    </div>
  );
};

export default LiveTwin;
