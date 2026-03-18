"use client";

import { Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

interface Props {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}

export default function LocationMarker({ onLocationSelect, initialPosition }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);

  useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
  }, [initialPosition]);

  const handleDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const latLng = marker.getLatLng();
    setPosition([latLng.lat, latLng.lng]);
    onLocationSelect?.(latLng.lat, latLng.lng);
  };

  if (!position) return null;

  return (
    <Marker position={position} draggable eventHandlers={{ dragend: handleDragEnd }}>
      <Popup>
        Latitude: {position[0].toFixed(5)} <br />
        Longitude: {position[1].toFixed(5)}
      </Popup>
    </Marker>
  );
}
