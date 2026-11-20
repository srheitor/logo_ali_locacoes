import { useEffect } from 'react';
import L from 'leaflet';
import { AttributionControl, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({ className: '', html: '<div class="location-pin"></div>', iconSize: [24, 24], iconAnchor: [12, 24] });

/** Recalcula o tamanho do mapa quando o contêiner é criado ou redimensionado (evita tiles cortados). */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

/** Clique no mapa para posicionar o imóvel (latitude/longitude usadas no cálculo de distância — RF04). */
export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={15} attributionControl={false} className="h-64 w-full rounded-lg">
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AttributionControl position="bottomright" prefix={false} />
      <MapResizeHandler />
      <ClickHandler onChange={onChange} />
      <Marker
        position={[latitude, longitude]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = (e.target as L.Marker).getLatLng();
            onChange(lat, lng);
          },
        }}
      />
    </MapContainer>
  );
}
