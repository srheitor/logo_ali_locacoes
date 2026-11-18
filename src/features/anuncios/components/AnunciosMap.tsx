import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Anuncio, Campus } from '@/shared/types/domain';
import { formatCurrency } from '@/shared/utils';

/** Marcador em formato de "etiqueta de preço" (evita problemas com os ícones PNG padrão do Leaflet). */
const priceIcon = (valor: number, active: boolean) =>
  L.divIcon({
    className: '',
    html: `<div class="price-pin ${active ? 'active' : ''}">${formatCurrency(valor).replace(',00', '')}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const campusIcon = L.divIcon({
  className: '',
  html: '<div class="campus-pin">🎓</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 15);
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

interface AnunciosMapProps {
  anuncios: Anuncio[];
  campus?: Campus;
  campusLabel?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  linkTo?: (id: string) => string;
  /** Rota pelas ruas até o campus ([lat, lng]), desenhada como linha. */
  rota?: Array<[number, number]>;
  className?: string;
}

/** RF06 — mapa interativo com marcadores dos imóveis e do campus do estudante. */
export function AnunciosMap({ anuncios, campus, campusLabel, selectedId, onSelect, linkTo, rota, className }: AnunciosMapProps) {
  const points = useMemo(() => {
    // Com uma rota, o enquadramento foca no imóvel selecionado, no campus e no caminho entre eles.
    const base = rota && selectedId ? anuncios.filter((a) => a.id === selectedId) : anuncios;
    const pts: Array<[number, number]> = base.map((a) => [a.latitude, a.longitude]);
    if (campus) pts.push([campus.latitude, campus.longitude]);
    if (rota) pts.push(...rota);
    return pts;
  }, [anuncios, campus, rota, selectedId]);

  return (
    <MapContainer center={[-21.7642, -43.3496]} zoom={14} scrollWheelZoom className={className ?? 'h-full w-full'}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {rota && (
        <>
          {/* contorno branco por baixo para a linha se destacar sobre o mapa */}
          <Polyline positions={rota} pathOptions={{ color: '#ffffff', weight: 8, opacity: 0.9 }} />
          <Polyline positions={rota} pathOptions={{ color: '#0d9488', weight: 5, opacity: 0.95 }} />
        </>
      )}
      {campus && (
        <Marker position={[campus.latitude, campus.longitude]} icon={campusIcon} zIndexOffset={1000}>
          <Popup>
            <strong>{campusLabel ?? campus.nome}</strong>
            <br />
            {campus.endereco}
          </Popup>
        </Marker>
      )}
      {anuncios.map((a) => (
        <Marker
          key={a.id}
          position={[a.latitude, a.longitude]}
          icon={priceIcon(a.valor_aluguel, a.id === selectedId)}
          zIndexOffset={a.id === selectedId ? 500 : 0}
          eventHandlers={{ click: () => onSelect?.(a.id) }}
        >
          <Popup>
            <strong>{a.titulo}</strong>
            <br />
            {formatCurrency(a.valor_aluguel)} · {a.bairro}
            {linkTo && (
              <>
                <br />
                <Link to={linkTo(a.id)}>Ver anúncio →</Link>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
