type HeatmapProps = {
  values: number[][];
  onSelect?: (row: number, col: number) => void;
  active?: { row: number; col: number };
};

const Heatmap = ({ values, onSelect, active }: HeatmapProps) => (
  <div className="heatmap-grid">
    {values.map((row, rowIndex) =>
      row.map((value, colIndex) => {
        const isActive = active?.row === rowIndex && active?.col === colIndex;
        return (
          <button
            key={`${rowIndex}-${colIndex}`}
            className={`heatmap-cell ${isActive ? 'active' : ''}`}
            style={{ opacity: 0.2 + value * 0.8 }}
            onClick={() => onSelect?.(rowIndex, colIndex)}
          />
        );
      }),
    )}
  </div>
);

export default Heatmap;
