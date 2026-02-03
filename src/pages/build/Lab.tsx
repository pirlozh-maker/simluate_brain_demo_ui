const Lab = () => (
  <div className="page lab">
    <div className="lab-layout">
      <aside className="panel">
        <h3>Experiment Tree</h3>
        {['Counterfactual A', 'Counterfactual B', 'Stability Sweep'].map((item) => (
          <button key={item} className="list-btn">
            {item}
          </button>
        ))}
      </aside>
      <section className="panel">
        <h3>Parameter Panel</h3>
        <div className="form-grid">
          <label>
            perturbation
            <input defaultValue="0.12" />
          </label>
          <label>
            sync window
            <input defaultValue="42ms" />
          </label>
          <label>
            cohort
            <input defaultValue="pilot-02" />
          </label>
        </div>
      </section>
      <aside className="panel">
        <h3>Reality Score</h3>
        <div className="score-bar">
          <div className="score-fill" style={{ width: '78%' }} />
        </div>
        <p className="muted">Counterfactual stability score: 0.78</p>
      </aside>
    </div>
  </div>
);

export default Lab;
