type GaugeProps = {
  label: string;
  value: number;
};

const Gauge = ({ label, value }: GaugeProps) => (
  <div className="gauge">
    <div className="gauge-header">
      <span>{label}</span>
      <strong>{Math.round(value * 100)}%</strong>
    </div>
    <div className="gauge-track">
      <div className="gauge-fill" style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

export default Gauge;
