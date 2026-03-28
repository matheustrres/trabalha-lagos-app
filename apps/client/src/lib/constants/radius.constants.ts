export const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 30, label: "30 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "Toda a região" },
] as const;

export type RadiusOption = (typeof RADIUS_OPTIONS)[number];
export type RadiusValue = RadiusOption["value"];
