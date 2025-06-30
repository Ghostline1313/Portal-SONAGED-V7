import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import proj4 from 'proj4';

// ==============================
// DÉFINITIONS PROJ4 POUR LE SÉNÉGAL
// ==============================
proj4.defs([
  [
    'EPSG:4326', // WGS84 (latitude/longitude)
    '+proj=longlat +datum=WGS84 +no_defs'
  ],
  [
    'EPSG:32628', // UTM Zone 28N (le plus couramment utilisé au Sénégal)
    '+proj=utm +zone=28 +datum=WGS84 +units=m +no_defs'
  ],
  [
    'EPSG:32627', // UTM Zone 27N (partie ouest du Sénégal)
    '+proj=utm +zone=27 +datum=WGS84 +units=m +no_defs'
  ],
  [
    'EPSG:2147', // Lambert Sénégal 
    '+proj=lcc +lat_1=13.5 +lat_2=15.5 +lat_0=14.5 +lon_0=-14 +x_0=400000 +y_0=300000 +ellps=clrk80 +towgs84=-263,6,431,0,0,0,0 +units=m +no_defs'
  ]
]);

// Détecte le système source selon les valeurs
const detectCoordinateSystem = (x: number, y: number) => {
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) return 'EPSG:4326';
  if (x >= 200000 && x <= 800000 && y >= 1400000 && y <= 1900000) return 'EPSG:32628';
  if (x >= 400000 && x <= 900000 && y >= 1400000 && y <= 1900000) return 'EPSG:32627';
  if (x >= 200000 && x <= 600000 && y >= 0 && y <= 500000) return 'EPSG:2147';
  console.warn(`Système de coordonnées non détecté pour [${x}, ${y}], utilisation d'UTM 28N par défaut`);
  return 'EPSG:32628';
};

const convertCoordinates = (coordinates: number[]) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return { longitude: null, latitude: null, error: 'Coordonnées invalides' };
  }
  const [x, y] = coordinates;
  if (typeof x !== 'number' || typeof y !== 'number') {
    return { longitude: null, latitude: null, error: 'Coordonnées non numériques' };
  }
  try {
    const sourceProj = detectCoordinateSystem(x, y);
    if (sourceProj === 'EPSG:4326') {
      return { longitude: x, latitude: y, sourceSystem: sourceProj };
    }
    const [longitude, latitude] = proj4(sourceProj, 'EPSG:4326', [x, y]);
    const senegalBounds = { minLon: -17.8, maxLon: -11.2, minLat: 12.0, maxLat: 16.8 };
    if (longitude >= senegalBounds.minLon && longitude <= senegalBounds.maxLon &&
        latitude >= senegalBounds.minLat && latitude <= senegalBounds.maxLat) {
      return {
        longitude: Number(longitude.toFixed(6)),
        latitude: Number(latitude.toFixed(6)),
        sourceSystem: sourceProj
      };
    } else {
      return {
        longitude: null,
        latitude: null,
        error: `Coordonnées converties hors limites du Sénégal: [${longitude.toFixed(2)}, ${latitude.toFixed(2)}]`
      };
    }
  } catch (error: any) {
    return {
      longitude: null,
      latitude: null,
      error: `Erreur de conversion: ${error.message}`
    };
  }
};

const extractCoordinates = (geometry: any) => {
  if (!geometry || !geometry.coordinates) return null;
  switch (geometry.type) {
    case 'Point': return geometry.coordinates;
    case 'LineString': return Array.isArray(geometry.coordinates[0]) ? geometry.coordinates[0] : null;
    case 'Polygon': return Array.isArray(geometry.coordinates[0]) && Array.isArray(geometry.coordinates[0][0]) ? geometry.coordinates[0][0] : null;
    case 'MultiPoint': return Array.isArray(geometry.coordinates[0]) ? geometry.coordinates[0] : null;
    case 'MultiLineString': return Array.isArray(geometry.coordinates[0]) && Array.isArray(geometry.coordinates[0][0]) ? geometry.coordinates[0][0] : null;
    case 'MultiPolygon': return Array.isArray(geometry.coordinates[0]) && Array.isArray(geometry.coordinates[0][0]) && Array.isArray(geometry.coordinates[0][0][0]) ? geometry.coordinates[0][0][0] : null;
    default: console.warn(`Type de géométrie non supporté: ${geometry.type}`); return null;
  }
};

// ==============================
// SUPABASE INITIALISATION
// ==============================

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://vwhcjojyliosynyfdgfy.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGNqb2p5bGlvc3lueWZkZ2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjg0NzIsImV4cCI6MjA2NTY0NDQ3Mn0.A__i77g6jjovS8QsttQcnmrS9__sSfAtDbOhGGpFYQk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ==============================
// UPLOADS BRUTS : GEOJSON, FICHIERS (ZIP, PDF, CSV)
// ==============================

// Upload d'un GeoJSON complet dans une table dédiée
export async function uploadWholeGeoJSON(
  geojson: any,
  name: string,
  description: string
) {
  const { data, error } = await supabase
    .from('geojson_datasets')
    .insert([
      {
        name,
        description,
        data: geojson, // toute la FeatureCollection d'un coup
      }
    ]);
  return { data, error };
}

// Upload d'un fichier brut (zip/pdf/csv) dans une table dédiée
export async function uploadRawFile(
  file: File,
  name: string,
  description: string,
  filetype: string
) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data, error } = await supabase
    .from('raw_files')
    .insert([
      {
        name,
        description,
        filetype,
        filename: file.name,
        filedata: uint8Array,
      }
    ]);
  return { data, error };
}

// ==============================
// UPLOAD GEOJSON AVEC PROJ4
// ==============================
export const uploadGeoJSONWithProj4 = async (
  geojson: any,
  table: 'collection_points' | 'urban_furniture' | 'sweeping_routes'
) => {
  try {
    if (!geojson || typeof geojson !== 'object') throw new Error('Le fichier doit contenir un objet JSON valide');
    if (geojson.type !== 'FeatureCollection') throw new Error('Le GeoJSON doit être de type "FeatureCollection"');
    if (!geojson.features || !Array.isArray(geojson.features)) throw new Error('Le GeoJSON doit contenir un tableau "features"');
    if (geojson.features.length === 0) throw new Error('Le GeoJSON ne contient aucune feature');

    const conversionStats = { total: geojson.features.length, success: 0, failed: 0, systems: {} as Record<string, number> };

    const toInsert = geojson.features.map((feature: any, index: number) => {
      try {
        const coordinates = extractCoordinates(feature.geometry);
        if (!coordinates) { conversionStats.failed++; return null; }
        const { longitude, latitude, sourceSystem, error } = convertCoordinates(coordinates);
        if (longitude === null || latitude === null) { conversionStats.failed++; return null; }
        conversionStats.success++;
        if (sourceSystem) conversionStats.systems[sourceSystem] = (conversionStats.systems[sourceSystem] || 0) + 1;

        const baseData = {
          latitude,
          longitude,
          commune_id: feature.properties?.commune_id || feature.properties?.COMMUNE_ID || null,
        };

        const getName = () =>
          feature.properties?.name ||
          feature.properties?.nom ||
          feature.properties?.NAME ||
          feature.properties?.NOM ||
          `Élément ${index + 1}`;

        const getStatus = () =>
          feature.properties?.status ||
          feature.properties?.statut ||
          feature.properties?.STATUS ||
          feature.properties?.STATUT;

        if (table === 'collection_points') {
          return {
            ...baseData,
            name: getName(),
            type: feature.properties?.type || feature.properties?.TYPE || 'bin',
            capacity_kg: Number(feature.properties?.capacity_kg || feature.properties?.capacite_kg || feature.properties?.CAPACITY_KG) || 0,
            waste_type: feature.properties?.waste_type || feature.properties?.type_dechet || feature.properties?.WASTE_TYPE || 'general',
            status: getStatus() || 'active',
          };
        }
        if (table === 'urban_furniture') {
          return {
            ...baseData,
            type: feature.properties?.type || feature.properties?.TYPE || 'PRN',
            name: getName(),
            location: feature.properties?.location || feature.properties?.adresse || feature.properties?.LOCATION || feature.properties?.ADRESSE || '',
            install_date: feature.properties?.install_date || feature.properties?.date_installation || feature.properties?.INSTALL_DATE || new Date().toISOString(),
            last_maintenance_date: feature.properties?.last_maintenance_date || feature.properties?.derniere_maintenance || feature.properties?.LAST_MAINTENANCE || null,
            capacity_kg: Number(feature.properties?.capacity_kg || feature.properties?.capacite_kg || feature.properties?.CAPACITY_KG) || 0,
            status: getStatus() || 'good',
          };
        }
        if (table === 'sweeping_routes') {
          return {
            name: getName(),
            code: feature.properties?.code || feature.properties?.CODE || feature.properties?.identifiant || feature.properties?.IDENTIFIANT || null,
            commune_id: feature.properties?.commune_id || feature.properties?.COMMUNE_ID || null,
            shift: feature.properties?.shift || feature.properties?.equipe || feature.properties?.SHIFT || feature.properties?.EQUIPE || 'matin',
            length_meters: Number(feature.properties?.length_meters || feature.properties?.longueur_m || feature.properties?.LENGTH_METERS || feature.properties?.LONGUEUR_M) || 0,
            estimated_duration_minutes: Number(feature.properties?.estimated_duration_minutes || feature.properties?.duree_estimee_min || feature.properties?.ESTIMATED_DURATION || feature.properties?.DUREE_ESTIMEE) || 0,
            status: getStatus() || 'active',
            ...(longitude && latitude ? { latitude, longitude } : {})
          };
        }
        return null;
      } catch (e) { conversionStats.failed++; return null; }
    }).filter(item => item !== null);

    if (toInsert.length === 0) throw new Error('Aucune feature valide trouvée dans le GeoJSON après conversion');
    const { data, error } = await supabase.from(table).insert(toInsert);
    if (error) throw new Error(`Erreur lors de l'insertion en base : ${error.message}`);
    return {
      data,
      count: toInsert.length,
      skipped: conversionStats.failed,
      conversionStats
    };
  } catch (error) {
    console.error('💥 Erreur dans uploadGeoJSON:', error);
    throw error;
  }
};

// ==============================
// API DB (CRUD + upload avancé)
// ==============================

export const db = {
  collectionPoints: {
    getAll: () => supabase.from('collection_points').select('*'),
    getById: (id: string) => supabase.from('collection_points').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['collection_points']['Insert']) => supabase.from('collection_points').insert(data),
    update: (id: string, data: Partial<Database['public']['Tables']['collection_points']['Insert']>) => supabase.from('collection_points').update(data).eq('id', id),
    delete: (id: string) => supabase.from('collection_points').delete().eq('id', id),
  },
  sweepingRoutes: {
    getAll: () => supabase.from('sweeping_routes').select('*'),
    getById: (id: string) => supabase.from('sweeping_routes').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['sweeping_routes']['Insert']) => supabase.from('sweeping_routes').insert(data),
    update: (id: string, data: Partial<Database['public']['Tables']['sweeping_routes']['Insert']>) => supabase.from('sweeping_routes').update(data).eq('id', id),
    delete: (id: string) => supabase.from('sweeping_routes').delete().eq('id', id),
  },
  urbanFurniture: {
    getAll: () => supabase.from('urban_furniture').select('*'),
    getById: (id: string) => supabase.from('urban_furniture').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['urban_furniture']['Insert']) => supabase.from('urban_furniture').insert(data),
    update: (id: string, data: Partial<Database['public']['Tables']['urban_furniture']['Insert']>) => supabase.from('urban_furniture').update(data).eq('id', id),
    delete: (id: string) => supabase.from('urban_furniture').delete().eq('id', id),
  },

  // Nouvelle version, conversion automatique (proj4) et robustesse
  uploadGeoJSON: uploadGeoJSONWithProj4,
};

export default supabase;