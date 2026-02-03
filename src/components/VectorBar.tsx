type VectorBarProps = {
  label: string;
  value: number;
};

const VectorBar = ({ label, value }: VectorBarProps) => (
  <div className="vector-bar">
    <div className="vector-label">
      <span>{label}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
    <div className="vector-track">
      <div className="vector-fill" style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

export default VectorBar;
