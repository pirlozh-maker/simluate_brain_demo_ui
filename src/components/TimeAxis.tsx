import { useUiStore } from '../store/useUiStore';

const TimeAxis = () => {
  const playbackMode = useUiStore((state) => state.playbackMode);
  const setPlaybackMode = useUiStore((state) => state.setPlaybackMode);

  return (
    <div className="time-axis">
      <div className="time-line">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="time-tick" />
        ))}
        <span className="time-playhead" />
      </div>
      <div className="time-actions">
        <button
          className={`time-btn ${playbackMode === 'paused' ? 'active' : ''}`}
          onClick={() =>
            setPlaybackMode(playbackMode === 'paused' ? 'live' : 'paused')
          }
        >
          {playbackMode === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button
          className={`time-btn ${playbackMode === 'replay' ? 'active' : ''}`}
          onClick={() => setPlaybackMode('replay')}
        >
          Replay 60s
        </button>
      </div>
    </div>
  );
};

export default TimeAxis;
