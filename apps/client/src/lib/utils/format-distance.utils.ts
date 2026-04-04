const DISTANCE_FORMATTER = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

export const formatDistanceKm = (distanceKm: number): string =>
  `${DISTANCE_FORMATTER.format(distanceKm)} km`;
