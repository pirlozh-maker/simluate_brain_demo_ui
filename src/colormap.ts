export type ColorStop = {
  stop: number;
  color: string;
};

export const COLORMAP_STOPS: ColorStop[] = [
  { stop: 0, color: '#1c2fbc' },
  { stop: 0.35, color: '#19b6d2' },
  { stop: 0.65, color: '#f0d84a' },
  { stop: 1, color: '#d61f3c' },
];

export const buildGradient = () =>
  `linear-gradient(180deg, ${COLORMAP_STOPS.map((stop) => `${stop.color} ${stop.stop * 100}%`).join(', ')})`;
