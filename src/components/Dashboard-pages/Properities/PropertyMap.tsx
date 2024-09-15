import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from '../../../assets/icons8-map-marker-ezgif.com-gif-maker.gif';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import satelliteThumbnail from '../../../assets/satellite-thumbnail.jpg'; 
import standardThumbnail from '../../../assets/standard-thumbnail.jpg';

const createCustomIcon = () => {
    return L.icon({
        iconUrl: markerIconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const CenterMapOnMarker: React.FC<{ position: LatLngExpression }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(position, map.getZoom());
        }
    }, [map, position]);
    return null;
};

const AddSearchControl: React.FC<{ setMarker: (latlng: LatLngExpression) => void; setPopupText: (text: string) => void }> = ({ setMarker, setPopupText }) => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: false,
            retainZoomLevel: true,
            autoClose: true,
            keepResult: true,
        });

        map.addControl(searchControl);

        map.on('geosearch/showlocation', (event: any) => {
            const { x, y, label } = event.location;
            const latlng: LatLngExpression = [y, x];
            setMarker(latlng);
            setPopupText(label);
            map.setView(latlng, map.getZoom());
        });

        return () => {
            map.removeControl(searchControl);
            map.off('geosearch/showlocation');
        };
    }, [map, setMarker, setPopupText]);

    return null;
};

const MapLayerControl: React.FC<{ toggleSatelliteView: () => void; isSatelliteView: boolean }> = ({ toggleSatelliteView, isSatelliteView }) => {
    const map = useMap();

    useEffect(() => {
        const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const viewImg = L.DomUtil.create('img', '', controlDiv);
        viewImg.src = isSatelliteView ? standardThumbnail : satelliteThumbnail;
        viewImg.title = isSatelliteView ? 'Switch to Standard View' : 'Switch to Satellite View';
        viewImg.style.cursor = 'pointer';
        viewImg.style.width = '32px';
        viewImg.style.height = '32px';
        viewImg.style.margin = '5px';
        viewImg.style.borderRadius = '50%';
        viewImg.style.border = '2px solid #007bff';

        L.DomEvent.on(viewImg, 'click', () => {
            toggleSatelliteView();
        });

        const layerControl = new L.Control({ position: 'topright' });
        layerControl.onAdd = () => controlDiv;
        layerControl.addTo(map);

        return () => {
            map.removeControl(layerControl);
        };
    }, [map, toggleSatelliteView, isSatelliteView]);

    return null;
};

const PropertyMap: React.FC<{
    onLocationSave?: (data: any) => void;
    locationData?: { latitude: number; longitude: number };
    disableSearch?: boolean;
    disableLayerControl?: boolean;
    hideLayerControl?: boolean;
}> = ({
    onLocationSave,
    locationData,
    disableSearch,
    disableLayerControl,
    hideLayerControl
}) => {
    const [marker, setMarker] = useState<LatLngExpression | null>(locationData ? [locationData.latitude, locationData.longitude] : null);
    const [popupText, setPopupText] = useState<string | null>(null);
    const [isSatelliteView, setIsSatelliteView] = useState(false);
    const [center, setCenter] = useState<LatLngExpression>([28.0339, 1.6596]);
    const [zoom, setZoom] = useState(6);

    const MapEventHandler = () => {
        useMapEvents({
            click: (e) => {
                const latlng: LatLngExpression = [e.latlng.lat, e.latlng.lng];
                setMarker(latlng);
                setPopupText(`Latitude: ${latlng[0]} Longitude: ${latlng[1]}`);
                setCenter(latlng);
                setZoom(13);
                if (onLocationSave) {
                    onLocationSave({ latitude: latlng[0], longitude: latlng[1] });
                }
            },
        });
        return null;
    };

    const toggleSatelliteView = () => {
        setIsSatelliteView(prevState => !prevState);
    };

    return (
        <MapContainer
            style={{ height: "500px", width: "100%" }}
            whenReady={({ target }) => {
                target.setView(center, zoom);
            }}
        >
            <TileLayer
                url={isSatelliteView 
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            />
            {!disableSearch && <AddSearchControl setMarker={setMarker} setPopupText={setPopupText} />}
            <MapEventHandler />
            {!disableLayerControl && !hideLayerControl && <MapLayerControl toggleSatelliteView={toggleSatelliteView} isSatelliteView={isSatelliteView} />}
            {marker && (
                <Marker position={marker} icon={createCustomIcon()}>
                    <Popup>
                        <div style={{ width: '20rem', height: 'auto', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                            {popupText}
                        </div>
                    </Popup>
                </Marker>
            )}
            <CenterMapOnMarker position={center} />
        </MapContainer>
    );
};

export default PropertyMap;
