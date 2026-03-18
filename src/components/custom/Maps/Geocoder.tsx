// "use client";

// import { useMap } from "react-leaflet";
// import { useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// import "leaflet-control-geocoder";

// interface Props {
//   onLocationSelect?: (lat: number, lng: number) => void;
// }

// export default function Geocoder({ onLocationSelect }: Props) {
//   const map = useMap();
//   const controlRef = useRef<any>(null);

//   useEffect(() => {
//     if (!controlRef.current) {
//       const geocoder = (L.Control as any).Geocoder.nominatim();
//       const control = (L.Control as any).geocoder({ geocoder }).addTo(map);
//       control.on("markgeocode", function (e: any) {
//         const center = e.geocode.center;
//         map.setView(center, 15);
//         onLocationSelect?.(center.lat, center.lng);
//       });
//       controlRef.current = control; // pastikan hanya sekali
//     }

//     // cleanup ketika unmount
//     return () => {
//       if (controlRef.current) {
//         map.removeControl(controlRef.current);
//         controlRef.current = null;
//       }
//     };
//   }, [map, onLocationSelect]);

//   return null;
// }

"use client";

import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

interface Props {
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function Geocoder({ onLocationSelect }: Props) {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!controlRef.current) {
      const geocoder = (L.Control as any).Geocoder.nominatim();
      const control = (L.Control as any)
        .geocoder({
          geocoder,
          defaultMarkGeocode: false, // penting
        })
        .addTo(map);

      control.on("markgeocode", function (e: any) {
        const center = e.geocode.center;
        map.setView(center, 15);
        onLocationSelect?.(center.lat, center.lng);
      });

      controlRef.current = control;
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, onLocationSelect]);

  return null;
}
