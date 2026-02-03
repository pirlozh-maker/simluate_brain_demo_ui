import { useTelemetryStore } from '../store/useTelemetryStore';
import { useTwinStore } from '../store/useTwinStore';
import Gauge from './Gauge';
import VectorBar from './VectorBar';
import TopologyMini from './TopologyMini';

const MetricsHud = () => {
  const telemetry = useTelemetryStore();
  const residual = useTwinStore((state) => state.residual);

  return (
    <div className="metrics-hud">
      <div className="metrics-primary">
        <div className="score">
          <span>Reality Score</span>
          <strong>{Math.round(telemetry.score * 100)}</strong>
        </div>
        <div className="score-note">Confidence lock: {Math.round(telemetry.confidence * 100)}%</div>
      </div>
      <div className="metrics-gauges">
        <Gauge label="Gap" value={telemetry.gap} />
        <Gauge label="Coverage" value={telemetry.coverage} />
        <Gauge label="Confidence" value={telemetry.confidence} />
      </div>
      <div className="metrics-secondary">
        <VectorBar label="Dyn Residual" value={residual} />
        <TopologyMini />
      </div>
    </div>
  );
};

export default MetricsHud;
