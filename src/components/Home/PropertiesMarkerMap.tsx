import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import satelliteThumbnail from '../../assets/satellite-thumbnail.jpg';
import standardThumbnail from '../../assets/standard-thumbnail.jpg';

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  terrain: boolean;
  latitude: number;
  longitude: number;
}

interface PropertiesMarkerMapProps {
  zoomedPropertyId?: string | null; // Updated to allow null
}

const mapContainerStyle = {
  height: '500px',
  width: '100%',
};

const defaultCenter = {
  lat: 29.1328017,  // Default center for Algeria
  lng: 0.9848549,
};

const PropertiesMarkerMap: React.FC<PropertiesMarkerMapProps> = ({ zoomedPropertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(5);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [pictures, setPictures] = useState<{ [key: number]: string[] }>({});

  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get("http://propelo.runasp.net/api/Property");
        setProperties(response.data);

        const picturePromises = response.data.map(async (property: Property) => {
          const pictureResponse = await axios.get(`http://propelo.runasp.net/api/PropertyPicture/property/${property.id}`);
          return {
            id: property.id,
            pictures: pictureResponse.data.map((pic: any) => pic.picturePath),
          };
        });

        const pictureData = await Promise.all(picturePromises);
        setPictures(pictureData.reduce((acc: any, item: any) => {
          acc[item.id] = item.pictures;
          return acc;
        }, {}));

        if (zoomedPropertyId) {
          const zoomedProperty = response.data.find(
            (property: Property) => property.id.toString() === zoomedPropertyId
          );
          if (zoomedProperty) {
            setCenter({ lat: zoomedProperty.latitude, lng: zoomedProperty.longitude });
            setZoom(16); // Change this to a higher value for closer zoom
          }
        }
        
      } catch (error) {
        console.error('Error fetching properties', error);
      }
    };

    fetchProperties();
  }, [zoomedPropertyId]);

  const handlePropertyClick = (property: Property) => {
    navigate(`/apartments/${property.id}`);
  };

  const toggleSatelliteView = () => {
    setIsSatelliteView((prevState) => !prevState);
  };

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          mapTypeId: isSatelliteView ? 'satellite' : 'roadmap',
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={{ lat: property.latitude, lng: property.longitude }}
            onClick={() => setSelectedProperty(property)} // Set selected property on marker click
          />
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div 
              className="w-[20rem] p-4 bg-white rounded-lg shadow-md cursor-pointer"
              onClick={() => handlePropertyClick(selectedProperty)} // Navigate on info window click
            >
              <div className="mb-4">
                {pictures[selectedProperty.id]?.length > 0 ? (
                  <img
                    src={pictures[selectedProperty.id][0]}
                    alt={`Picture of ${selectedProperty.name}`}
                    className="w-full h-40 object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <img
                    src="/path/to/default-image.jpg"
                    alt="No picture available"
                    className="w-full h-40 object-cover rounded-md shadow-sm"
                  />
                )}
                <h2 className="text-lg font-bold text-gray-800 mb-1">{selectedProperty.name}</h2>
              </div>
              <div className="mb-2">
                <span className="block text-gray-500 font-semibold">Address:</span>
                <strong className="text-gray-700">{selectedProperty.address}</strong>
              </div>
              <div className="mb-2">
                <span className="block text-gray-500 font-semibold">City:</span>
                <strong className="text-gray-700">{selectedProperty.city}</strong>
              </div>
              <div className="mb-2">
                <span className="block text-gray-500 font-semibold">Terrain:</span>
                <strong className="text-gray-700">{selectedProperty.terrain ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <img
          src={isSatelliteView ? standardThumbnail : satelliteThumbnail}
          alt="Toggle Satellite View"
          onClick={toggleSatelliteView}
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default PropertiesMarkerMap;
