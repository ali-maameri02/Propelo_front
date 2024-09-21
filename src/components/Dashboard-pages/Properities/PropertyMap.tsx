import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Define constants outside the component
const mapContainerStyle = {
  height: "500px",
  width: "100%"
};

const defaultCenter = { lat: 28.0339, lng: 1.6596 };
const libraries: Array<'places'> = ['places']; // Ensure libraries is a constant

const PropertyMap: React.FC<{
  onLocationSave?: (data: { latitude: number; longitude: number }) => void;
  locationData?: { latitude: number; longitude: number };
}> = ({ onLocationSave, locationData }) => {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    locationData ? { lat: locationData.latitude, lng: locationData.longitude } : null
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
    libraries // Use static libraries array
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });

        if (onLocationSave) {
          onLocationSave({ latitude: lat, longitude: lng });
        }
      }
    }
  };

  useEffect(() => {
    if (locationData) {
      setMarkerPosition({ lat: locationData.latitude, lng: locationData.longitude });
      setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
    }
  }, [locationData]);

  return isLoaded ? (
    <div style={{ position: 'relative' }}>
      <Autocomplete
        onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Search for a place"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '5px',
            width: '300px'
          }}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        onClick={onMapClick}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {/* Display the previously set marker */}
        {locationData && (
          <Marker
            position={{ lat: locationData.latitude, lng: locationData.longitude }}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            label="Previous"
          />
        )}
        {/* Display the current marker */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={(event) => {
              if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                setMarkerPosition({ lat, lng });
                setMapCenter({ lat, lng });

                if (onLocationSave) {
                  onLocationSave({ latitude: lat, longitude: lng });
                }
              }
            }}
            icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            label="Current"
          />
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading Map...</div>
  );
};

export default PropertyMap;
