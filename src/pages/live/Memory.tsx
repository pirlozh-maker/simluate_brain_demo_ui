const LiveMemory = () => (
  <div className="page memory">
    <div className="memory-layout">
      <section className="panel">
        <h3>Live Memory</h3>
        <div className="timeline">
          {['Live session checkpoint', 'Coaching insight saved', 'Replay ready'].map(
            (event) => (
              <div key={event} className="timeline-item">
                <strong>{event}</strong>
                <span>Just now</span>
              </div>
            ),
          )}
        </div>
      </section>
      <aside className="panel">
        <h3>Evidence Drawer</h3>
        <p className="muted">Live session evidence stored here.</p>
        <button className="action-btn">Open Evidence</button>
      </aside>
    </div>
  </div>
);

export default LiveMemory;
