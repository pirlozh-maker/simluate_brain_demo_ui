const Settings = () => (
  <div className="page settings">
    <div className="settings-layout">
      <section className="panel">
        <h3>Privacy</h3>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span>Encrypt local twin memory</span>
        </label>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span>Redact biometric traces</span>
        </label>
      </section>
      <section className="panel">
        <h3>Storage Strategy</h3>
        <label>
          Retention window
          <select>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </label>
        <label>
          Replay format
          <select>
            <option>Lightweight</option>
            <option>Full fidelity</option>
          </select>
        </label>
      </section>
      <section className="panel danger">
        <h3>Emergency</h3>
        <p>Immediate data shred for demo.</p>
        <button className="action-btn danger">Emergency Destroy</button>
      </section>
    </div>
  </div>
);

export default Settings;
