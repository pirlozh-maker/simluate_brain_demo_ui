const Coach = () => (
  <div className="page coach">
    <div className="coach-layout">
      <section className="panel">
        <h3>Coach Guidance</h3>
        <div className="coach-card">
          <strong>Focus Layer</strong>
          <p>Stabilize EMG mapping on right forearm.</p>
        </div>
        <div className="coach-card">
          <strong>Recovery</strong>
          <p>Suggest short recalibration of phase sync.</p>
        </div>
      </section>
      <aside className="panel">
        <h3>Feedback Loop</h3>
        <textarea placeholder="Input manual coaching..." />
        <button className="action-btn">Send to Twin</button>
      </aside>
    </div>
  </div>
);

export default Coach;
