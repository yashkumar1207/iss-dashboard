import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ISS Icon (You can replace this with a better image if available)
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export function ISSMap({ position, path, loading }) {
  if (loading || !position) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground">Acquiring satellite signal...</span>
      </div>
    );
  }

  const center = [position.lat, position.lng];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={4} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={issIcon}>
          <Popup>
            <div className="text-center">
              <strong>ISS Current Location</strong><br/>
              Lat: {position.lat.toFixed(4)}<br/>
              Lng: {position.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
        {path && path.length > 1 && (
          <Polyline positions={path} color="red" weight={3} opacity={0.7} dashArray="5, 10" />
        )}
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}
