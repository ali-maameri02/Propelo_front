import { useMapEvents } from 'react-leaflet';
import  { LatLngTuple } from 'leaflet';

interface MapEventsProps {
  addMarker: (latlng: LatLngTuple) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ addMarker }) => {
  useMapEvents({
    click(e) {
      const { latlng } = e;
      addMarker([latlng.lat, latlng.lng]);
    },
  });

  return null;
};
