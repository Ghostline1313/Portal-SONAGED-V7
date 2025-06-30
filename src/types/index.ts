export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'geomaticien';
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  lastUpdated?: string;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  lastUpdated: string;
  format: 'SHP' | 'GeoJSON' | 'CSV' | 'KML';
  owner: string;
  tags: string[];
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'point' | 'line' | 'polygon' | 'raster';
  source: string;
  visible: boolean;
  opacity: number;
  style?: any;
  datasetId?: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  type: 'container' | 'bin' | 'center';
  coordinates: [number, number];
  capacity: number;
  fillLevel?: number;
  lastCollection?: string;
  wasteType: 'general' | 'recyclable' | 'organic' | 'hazardous';
}

export interface RouteData {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number][];
  distance: number;
  duration: number;
  wasteCollected: number;
  date: string;
  vehicleId: string;
}

export interface SweepingRoute {
  id: string;
  code: string;
  name: string;
  region: string;
  department: string;
  commune: string;
  shift: string;
  length: number;
  geometry?: {
    type: string;
    coordinates: number[][] | number[][][] | number[][][][];
  };
}