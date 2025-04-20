// components/LocationPicker.tsx
import { useMapEvents, Marker } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface LocationPickerProps {
  coors: { lat: number; lng: number };
  setCoors: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({
  coors,
  setCoors,
}: LocationPickerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoors({ lat, lng });
    },
  });

  return <Marker position={coors as LatLngExpression} />;
}
