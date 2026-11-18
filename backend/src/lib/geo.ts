/** RF04 / consulta 2 — distância em linha reta (Haversine), em km com 2 casas. */
export function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = (g: number) => (g * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(km * 100) / 100;
}
