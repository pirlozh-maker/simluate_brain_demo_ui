import { useUiStore } from '../store/useUiStore';

const OverlayToggles = () => {
  const overlay = useUiStore((state) => state.overlay);
  const toggleOverlay = useUiStore((state) => state.toggleOverlay);

  return (
    <div className="overlay-toggles">
      {(
        [
          ['eeg', 'EEG Heat'],
          ['emg', 'EMG Heat'],
          ['force', 'Force Vectors'],
          ['phase', 'Phase'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          className={`overlay-btn ${overlay[key] ? 'active' : ''}`}
          onClick={() => toggleOverlay(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default OverlayToggles;
