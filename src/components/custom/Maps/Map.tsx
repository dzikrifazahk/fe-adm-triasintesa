import dynamic from "next/dynamic";

interface MapProps {
  marker: [number, number] | null;
  setMarker: (pos: [number, number] | null) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

export default function Map({ marker, setMarker, onLocationSelect }: MapProps) {
  return (
    <MapClient
      marker={marker}
      setMarker={setMarker}
      onLocationSelect={onLocationSelect}
    />
  );
}
