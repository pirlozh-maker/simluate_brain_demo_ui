import { useTwinStore } from '../store/useTwinStore';

const TopologyMini = () => {
  const covariance = useTwinStore((state) => state.covariance);

  return (
    <div className="topology-mini">
      <div className="topology-title">Covariance Topology</div>
      <svg viewBox="0 0 120 80">
        {covariance.slice(0, 6).map((value, index) => (
          <line
            key={`line-${index}`}
            x1={10 + index * 15}
            y1={15}
            x2={40 + index * 8}
            y2={60}
            stroke={`rgba(109, 240, 255, ${0.2 + value * 0.8})`}
            strokeWidth="1.5"
          />
        ))}
        {covariance.slice(0, 8).map((value, index) => (
          <circle
            key={`node-${index}`}
            cx={15 + index * 12}
            cy={20 + (index % 3) * 18}
            r={4 + value * 3}
            fill="rgba(109, 240, 255, 0.8)"
          />
        ))}
      </svg>
    </div>
  );
};

export default TopologyMini;
