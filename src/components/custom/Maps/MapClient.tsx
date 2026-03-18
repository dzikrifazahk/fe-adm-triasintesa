"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Geocoder from "./Geocoder";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface Props {
  marker: [number, number] | null;
  setMarker: (pos: [number, number] | null) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function MapClient({
  marker,
  setMarker,
  onLocationSelect,
}: Props) {
  function ClickHandler() {
    useMapEvents({
      click(e) {
        setMarker([e.latlng.lat, e.latlng.lng]);
        onLocationSelect?.(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl shadow-md z-20 bg-red-400">
      <MapContainer
        center={[-6.2, 106.816666]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full rounded-xl"
        attributionControl={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler />

        <Geocoder
          onLocationSelect={(lat, lng) => {
            setMarker([lat, lng]); // gunakan props setMarker
            onLocationSelect?.(lat, lng);
          }}
        />

        {marker && (
          <Marker
            position={marker}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const latLng = e.target.getLatLng();
                setMarker([latLng.lat, latLng.lng]);
                onLocationSelect?.(latLng.lat, latLng.lng);
              },
            }}
          >
            <Popup>
              Latitude: {marker[0].toFixed(5)} <br />
              Longitude: {marker[1].toFixed(5)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
