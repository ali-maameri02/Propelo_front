import { useMapEvents } from 'react-leaflet';

type LatLngTuple = [number, number];

interface MapEventsProps {
  addMarker: (latlng: LatLngTuple) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ addMarker }) => {
  useMapEvents({
    click(e: { latlng: any; }) {
      const { latlng } = e;
      addMarker([latlng.lat, latlng.lng]);
    },
  });

  return null;
};

export default MapEvents;
