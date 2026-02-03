import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { usePipelineStore } from '../store/usePipelineStore';

const TopBar = () => {
  const navigate = useNavigate();
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const telemetry = useTelemetryStore();
  const qaPassStreak = usePipelineStore((state) => state.qaPassStreak);

  const liveUnlocked = useMemo(
    () => telemetry.score > 0.82 && qaPassStreak >= 2,
    [telemetry.score, qaPassStreak],
  );

  const handleModeSwitch = (next: 'BUILD' | 'LIVE') => {
    setMode(next);
    const route = next === 'BUILD' ? '/build/cockpit' : '/live/twin';
    navigate(route);
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        <div>
          <div className="brand-title">EverSelf</div>
          <div className="brand-subtitle">Digital Twin System</div>
        </div>
      </div>
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'BUILD' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('BUILD')}
        >
          BUILD
        </button>
        <button
          className={`mode-btn ${mode === 'LIVE' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('LIVE')}
        >
          LIVE
          {!liveUnlocked && <span className="mode-lock">Demo/Replay Only</span>}
        </button>
      </div>
      <div className="twin-status">
        <div>
          <span>Conn</span>
          <strong>{telemetry.quality > 0.7 ? 'Linked' : 'Degraded'}</strong>
        </div>
        <div>
          <span>Sync</span>
          <strong>{telemetry.phase}</strong>
        </div>
        <div>
          <span>Quality</span>
          <strong>{Math.round(telemetry.quality * 100)}%</strong>
        </div>
        <div>
          <span>Latency</span>
          <strong>{telemetry.latency}ms</strong>
        </div>
        <div>
          <span>Drop</span>
          <strong>{Math.round(telemetry.dropout * 100)}%</strong>
        </div>
      </div>
      <div className="quick-actions">
        {['Import', 'Real', 'New Batch', 'Run', 'Compare', 'Export'].map((action) => (
          <button key={action} className="action-btn">
            {action}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;
