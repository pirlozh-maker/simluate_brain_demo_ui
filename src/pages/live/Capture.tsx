const Capture = () => (
  <div className="page capture">
    <div className="capture-layout">
      <section className="panel">
        <h3>Capture Stream</h3>
        <div className="capture-feed" />
        <div className="capture-actions">
          <button className="action-btn">Record</button>
          <button className="action-btn ghost">Tag Event</button>
          <button className="action-btn ghost">Save Replay</button>
        </div>
      </section>
      <aside className="panel">
        <h3>Capture Notes</h3>
        <textarea placeholder="Add live annotations..." />
      </aside>
    </div>
  </div>
);

export default Capture;
