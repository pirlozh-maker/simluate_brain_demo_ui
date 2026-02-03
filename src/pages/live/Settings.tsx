const LiveSettings = () => (
  <div className="page settings">
    <div className="settings-layout">
      <section className="panel">
        <h3>Live Privacy</h3>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span>Mask real-time identifiers</span>
        </label>
        <label className="toggle">
          <input type="checkbox" />
          <span>Allow coach feedback loop</span>
        </label>
      </section>
      <section className="panel">
        <h3>Playback</h3>
        <label>
          Replay buffer
          <select>
            <option>60s</option>
            <option>120s</option>
          </select>
        </label>
        <label>
          Export format
          <select>
            <option>Compact</option>
            <option>Full</option>
          </select>
        </label>
      </section>
    </div>
  </div>
);

export default LiveSettings;
