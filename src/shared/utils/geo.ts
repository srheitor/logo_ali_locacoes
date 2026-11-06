/** Cálculos geográficos (RF04). A distância é calculada em tempo real e não é persistida. */

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distância em linha reta (fórmula de Haversine), em km — mesma lógica da Consulta SQL 2. */
export function haversineKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface EstimativaDeslocamento {
  distanciaKm: number;
  minutosAPe: number;
  minutosOnibus: number;
}

/**
 * Estimativa simplificada para o protótipo:
 * - fator 1,3 sobre a linha reta para aproximar o trajeto pelas ruas;
 * - a pé a 5 km/h; ônibus a 18 km/h + 8 min de espera média.
 * Em produção, substituir por uma API de rotas (OSRM, Google Directions etc.).
 */
export function estimarDeslocamento(origem: Coordenadas, destino: Coordenadas): EstimativaDeslocamento {
  const distanciaKm = haversineKm(origem, destino);
  const trajeto = distanciaKm * 1.3;
  return {
    distanciaKm,
    minutosAPe: Math.max(1, Math.round((trajeto / 5) * 60)),
    minutosOnibus: Math.max(5, Math.round((trajeto / 18) * 60 + 8)),
  };
}

export const formatKm = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

export const formatMinutos = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
