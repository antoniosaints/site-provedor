import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned } from 'lucide-react';
import { assetUrl } from '../../lib/api';

type CoverageLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  markerIconUrl?: string | null;
};

type CoverageMapSectionProps = {
  locations?: CoverageLocation[];
  companyName?: string;
};

function normalizeLocations(locations?: CoverageLocation[]) {
  return (locations ?? [])
    .map((location) => ({
      ...location,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude)
    }))
    .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));
}

function googleMapsUrl(location: { latitude: number; longitude: number; name: string }) {
  const query = new URLSearchParams({ api: '1', query: `${location.latitude},${location.longitude}` });
  return `https://www.google.com/maps/search/?${query.toString()}`;
}

function markerLabel(companyName: string) {
  const label = companyName.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
  return label || 'NET';
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markerIcon(location: { markerIconUrl?: string | null }, iconLabel: string) {
  const markerImage = assetUrl(location.markerIconUrl);

  return L.divIcon({
    className: 'coverage-map-marker',
    html: markerImage ? `<img src="${escapeAttribute(markerImage)}" alt="" />` : `<span>${iconLabel}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 34],
    popupAnchor: [0, -30]
  });
}

function popupContent(location: { name: string; address: string; latitude: number; longitude: number }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'coverage-map-popup';

  const title = document.createElement('strong');
  title.textContent = location.name;
  wrapper.appendChild(title);

  const address = document.createElement('span');
  address.textContent = location.address;
  wrapper.appendChild(address);

  const link = document.createElement('a');
  link.href = googleMapsUrl(location);
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = 'Ver no Google Maps';
  wrapper.appendChild(link);

  return wrapper;
}

export function CoverageMapSection({ locations, companyName = 'MEGANET' }: CoverageMapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const validLocations = useMemo(() => normalizeLocations(locations), [locations]);
  const iconLabel = useMemo(() => markerLabel(companyName), [companyName]);

  useEffect(() => {
    if (!mapContainerRef.current || !validLocations.length) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();
    const bounds = L.latLngBounds([]);
    validLocations.forEach((location) => {
      const position: L.LatLngExpression = [location.latitude, location.longitude];
      bounds.extend(position);
      L.marker(position, { icon: markerIcon(location, iconLabel) }).bindPopup(popupContent(location)).addTo(markers);
    });

    if (validLocations.length === 1) {
      map.setView([validLocations[0].latitude, validLocations[0].longitude], 12);
    } else {
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 12 });
    }

    window.setTimeout(() => map.invalidateSize(), 120);
  }, [iconLabel, validLocations]);

  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
    markersRef.current = null;
  }, []);

  if (!validLocations.length) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-bold text-brand-700">Cobertura</p>
          <h2 className="font-display text-4xl font-bold text-brand-900">Mapa de cobertura</h2>
          <p className="mt-3 text-lg leading-8 text-slate-600">Confira os locais com disponibilidade de atendimento {companyName}.</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <div ref={mapContainerRef} className="h-[420px] w-full bg-slate-100 sm:h-[520px]" />
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {validLocations.map((location) => (
            <li key={location.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm">
              <MapPinned className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <span>
                <strong className="block text-sm text-brand-900">{location.name}</strong>
                <small className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{location.address}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
