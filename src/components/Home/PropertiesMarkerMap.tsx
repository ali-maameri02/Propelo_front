import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from '../../assets/icons8-map-marker-ezgif.com-gif-maker.gif';
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
  zoomedPropertyId?: string; // Optional propertyId passed from ApartmentDetail
}

const createCustomIcon = () => {
    return L.icon({
        iconUrl: markerIconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const PropertiesMarkerMap: React.FC<PropertiesMarkerMapProps> = ({ zoomedPropertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [center, setCenter] = useState<LatLngTuple>([28.0339, 1.6596]); // Default center for Algeria
  const [zoom, setZoom] = useState(6); // Default zoom
  const [pictures, setPictures] = useState<{ [key: number]: string[] }>({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get("http://propelo.runasp.net/api/Property");
        setProperties(response.data);

        const picturePromises = response.data.map(async (property: Property) => {
            const pictureResponse = await axios.get(`http://propelo.runasp.net/api/PropertyPicture/property/${property.id}`);
            return {
              id: property.id,
              pictures: pictureResponse.data.map((pic: any) => pic.picturePath)
            };
          });

        const pictureData = await Promise.all(picturePromises);
        setPictures(pictureData.reduce((acc: any, item: any) => {
            acc[item.id] = item.pictures;
            return acc;
        }, {}));

        // If zoomedPropertyId is provided, adjust center and zoom for apartment details
        if (zoomedPropertyId) {
          const zoomedProperty = response.data.find(
            (property: Property) => property.id.toString() === zoomedPropertyId
          );
          if (zoomedProperty) {
            setCenter([zoomedProperty.latitude, zoomedProperty.longitude]);
            setZoom(10); // Zoom level for close-up view
          }
        }
      } catch (error) {
        console.error("Error fetching properties", error);
      }
    };

    fetchProperties();
  }, [zoomedPropertyId]);

  const toggleSatelliteView = () => {
    setIsSatelliteView(prevState => !prevState);
  };

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url={isSatelliteView
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        {properties
          .filter(property => !zoomedPropertyId || property.id.toString() === zoomedPropertyId) // Filter based on page
          .map((property) => (
            <Marker key={property.id} position={[property.latitude, property.longitude] as LatLngTuple} icon={createCustomIcon()}>
              <Popup className="w-[20rem] h-full p-4 bg-white rounded-lg shadow-md">
                <div className="mb-4">
                  {pictures[property.id]?.length > 0 ? (
                    <div className="mb-4">
                      <img
                        src={pictures[property.id][0]}  
                        alt={`Picture of ${property.name}`}
                        className="w-full h-40 object-cover rounded-md shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <img
                        src="/path/to/default-image.jpg"  // Provide a valid path here
                        alt="No picture available"
                        className="w-full h-40 object-cover rounded-md shadow-sm"
                      />
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{property.name}</h2>
                </div>
                {/* Additional property details */}
                <div className="mb-2">
                  <span className="block text-gray-500 font-semibold">Address:</span>
                  <strong className="text-gray-700">{property.address}</strong>
                </div>
                <div className="mb-2">
                  <span className="block text-gray-500 font-semibold">City:</span>
                  <strong className="text-gray-700">{property.city}</strong>
                </div>
                <div className="mb-2">
                  <span className="block text-gray-500 font-semibold">Terrain:</span>
                  <strong className="text-gray-700">{property.terrain ? 'Yes' : 'No'}</strong>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
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
