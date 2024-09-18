import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  height: "500px",
  width: "100%"
};

const defaultCenter = { lat: 28.0339, lng: 1.6596 };

const PropertyMap: React.FC<{
  onLocationSave?: (data: { latitude: number; longitude: number }) => void;
  locationData?: { latitude: number; longitude: number };
}> = ({
  onLocationSave,
  locationData
}) => {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    locationData ? { lat: locationData.latitude, lng: locationData.longitude } : null
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "", // Ensure the key is a string
    libraries: ['places']
  });
  
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      
      if (onLocationSave) {
        onLocationSave({ latitude: lat, longitude: lng });
      }
    }
  }, [onLocationSave]);

  useEffect(() => {
    if (locationData) {
      setMarkerPosition({ lat: locationData.latitude, lng: locationData.longitude });
      setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
    }
  }, [locationData]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={13}
      onClick={onMapClick}
    >
      {markerPosition && (
        <Marker
          position={markerPosition}
          clickable
        />
      )}
    </GoogleMap>
  ) : (
    <div>Loading Map...</div>
  );
};

export default PropertyMap;
