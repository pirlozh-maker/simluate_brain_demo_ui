const Memory = () => (
  <div className="page memory">
    <div className="memory-layout">
      <section className="panel">
        <h3>Memory Timeline</h3>
        <div className="timeline">
          {['Recalibrated v312', 'QA fail: sync_drift', 'Bench run 02'].map((event) => (
            <div key={event} className="timeline-item">
              <strong>{event}</strong>
              <span>2h ago</span>
            </div>
          ))}
        </div>
      </section>
      <aside className="panel">
        <h3>Memory Detail</h3>
        <p>Session memory stored with replay and evidence.</p>
        <button className="action-btn">Open Evidence Drawer</button>
      </aside>
    </div>
  </div>
);

export default Memory;
