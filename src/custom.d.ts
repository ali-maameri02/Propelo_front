// src/custom.d.ts
declare module 'leaflet-geosearch' {
    import L from 'leaflet';

    export class GeoSearchControl extends L.Control {
        constructor(options?: any);
    }

    export class OpenStreetMapProvider {
        constructor();
    }
}
