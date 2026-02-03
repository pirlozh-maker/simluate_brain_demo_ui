import { useTelemetryStore } from '../store/useTelemetryStore';

const TelemetryStrip = () => {
  const telemetry = useTelemetryStore();

  return (
    <div className="telemetry-strip">
      <div>
        <span>Quality</span>
        <strong>{Math.round(telemetry.quality * 100)}%</strong>
      </div>
      <div>
        <span>Latency</span>
        <strong>{telemetry.latency}ms</strong>
      </div>
      <div>
        <span>Dropout</span>
        <strong>{Math.round(telemetry.dropout * 100)}%</strong>
      </div>
      <div>
        <span>Score</span>
        <strong>{Math.round(telemetry.score * 100)}</strong>
      </div>
    </div>
  );
};

export default TelemetryStrip;
