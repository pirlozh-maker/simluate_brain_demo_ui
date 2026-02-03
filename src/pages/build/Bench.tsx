import { useMemo, useState } from 'react';
import Heatmap from '../../components/Heatmap';
import TwinStage from '../../components/TwinStage';

const Bench = () => {
  const [active, setActive] = useState({ row: 2, col: 2 });

  const values = useMemo(
    () =>
      Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 0.2 + Math.random() * 0.8),
      ),
    [],
  );

  return (
    <div className="page bench">
      <div className="bench-layout">
        <section className="panel">
          <h3>Robustness Field</h3>
          <p className="muted">noise_strength × dropout_rate → performance</p>
          <Heatmap values={values} active={active} onSelect={(row, col) => setActive({ row, col })} />
        </section>
        <section className="panel bench-preview">
          <h3>Representative Sample</h3>
          <TwinStage />
        </section>
        <aside className="panel">
          <h3>Explainers</h3>
          <div className="metric-row">
            <span>noise_strength</span>
            <strong>{(active.row + 1) * 0.2}</strong>
          </div>
          <div className="metric-row">
            <span>dropout_rate</span>
            <strong>{(active.col + 1) * 0.1}</strong>
          </div>
          <div className="metric-row">
            <span>performance</span>
            <strong>{Math.round(values[active.row][active.col] * 100)}</strong>
          </div>
          <p className="muted">High noise shows kinematics drift and EMG phase lag.</p>
        </aside>
      </div>
    </div>
  );
};

export default Bench;
