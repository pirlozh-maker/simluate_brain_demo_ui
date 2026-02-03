import { useState } from 'react';

const Compare = () => {
  const [alignMode, setAlignMode] = useState('phase-lock');

  return (
    <div className="page compare">
      <div className="compare-layout">
        <aside className="panel">
          <h3>Pair Picker</h3>
          <label>
            Real Session
            <select>
              <option>Session R-204</option>
              <option>Session R-198</option>
            </select>
          </label>
          <label>
            Twin Version
            <select>
              <option>v312</option>
              <option>v304</option>
            </select>
          </label>
          <label>
            Align Mode
            <select value={alignMode} onChange={(event) => setAlignMode(event.target.value)}>
              <option value="phase-lock">phase-lock</option>
              <option value="time-warp">time-warp</option>
              <option value="synaptic">synaptic</option>
            </select>
          </label>
        </aside>
        <section className="panel diff-field">
          <h3>Diff Field</h3>
          <div className="diff-layers">
            {['Kinematics', 'Dynamics', 'EEG+EMG Stats'].map((layer) => (
              <div key={layer} className="diff-card">
                <span>{layer}</span>
                <div className="diff-visual" />
              </div>
            ))}
          </div>
        </section>
        <aside className="panel">
          <h3>Calibration Actions</h3>
          {[
            'fit noise',
            'update contact',
            'update emg mapping',
            'save version',
          ].map((action) => (
            <button key={action} className="action-btn">
              {action}
            </button>
          ))}
          <div className="muted">Align mode: {alignMode}</div>
        </aside>
      </div>
    </div>
  );
};

export default Compare;
