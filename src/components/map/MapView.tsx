import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CollectionPoint, MapLayer } from '../../types';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data pour les points de collecte
const mockCollectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'Point de collecte Centre-ville',
    type: 'container',
    coordinates: [14.7167, -17.4677], // Dakar coordinates
    capacity: 1000,
    fillLevel: 75,
    lastCollection: '2025-03-15T10:30:00',
    wasteType: 'general',
  },
  {
    id: '2',
    name: 'Point de collecte Plateau',
    type: 'container',
    coordinates: [14.6769, -17.4456],
    capacity: 800,
    fillLevel: 45,
    lastCollection: '2025-03-16T08:15:00',
    wasteType: 'recyclable',
  },
  {
    id: '3',
    name: 'Point de collecte Medina',
    type: 'container',
    coordinates: [14.6892, -17.4486],
    capacity: 1200,
    fillLevel: 90,
    lastCollection: '2025-03-14T14:30:00',
    wasteType: 'organic',
  }
];

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
  showNorthArrow?: boolean;
  showScale?: boolean;
  showLogo?: boolean;
  selectedRoute?: any;
  focusedDataset?: any;
  datasetGeoJSON?: any;
  layers?: MapLayer[];
  onLayerChange?: (layers: MapLayer[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  center = [14.7167, -17.4677],
  zoom = 13,
  showLegend = true,
  showNorthArrow = true,
  showScale = true,
  showLogo = true,
  selectedRoute, 
  focusedDataset, 
  datasetGeoJSON,
  layers = [],
  onLayerChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(layers);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const datasetLayerRef = useRef<L.LayerGroup | null>(null);
  const customLayersRef = useRef<L.LayerGroup[]>([]);

  // Fonctions utilitaires
  const getFillLevelColor = (level?: number) => {
    if (!level) return '#E5E7EB';
    if (level < 30) return '#10B981';
    if (level < 70) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Créer la carte Leaflet
    map.current = L.map(mapContainer.current, {
      center: [center[0], center[1]],
      zoom: zoom,
      maxZoom: 18,
      minZoom: 3
    });

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Ajouter les contrôles
    L.control.zoom({ position: 'topright' }).addTo(map.current);
    
    // Ajouter l'échelle nativement avec Leaflet
    if (showScale) {
      L.control.scale({ 
        position: 'bottomleft',
        metric: true,
        imperial: false 
      }).addTo(map.current);
    }

    // Initialiser les groupes de couches
    routeLayerRef.current = L.layerGroup().addTo(map.current);
    datasetLayerRef.current = L.layerGroup().addTo(map.current);

    setMapLoaded(true);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, showScale]);

  // Chargement des points de collecte
  useEffect(() => {
    setTimeout(() => {
      setCollectionPoints(mockCollectionPoints);
    }, 1000);
  }, []);

  // Gestion des points de collecte
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Supprimer les marqueurs existants
    markersRef.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Ajouter les nouveaux points de collecte
    collectionPoints.forEach((point) => {
      const fillColor = getFillLevelColor(point.fillLevel);
      
      // Créer une icône personnalisée
      const customIcon = L.divIcon({
        className: 'custom-collection-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${fillColor};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Créer le contenu du popup
      const popupContent = `
        <div style="padding: 12px; max-width: 250px;">
          <h3 style="font-weight: 500; font-size: 16px; margin-bottom: 8px;">${point.name}</h3>
          <p style="font-size: 14px; color: #666; text-transform: capitalize; margin-bottom: 8px;">
            ${point.type} - ${point.wasteType}
          </p>
          <div style="margin-bottom: 8px;">
            <p style="font-size: 12px; color: #888;">Niveau de remplissage</p>
            <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 8px; margin-top: 4px;">
              <div style="
                height: 8px;
                border-radius: 4px;
                width: ${point.fillLevel || 0}%;
                background-color: ${fillColor};
              "></div>
            </div>
            <p style="font-size: 12px; text-align: right; margin-top: 4px;">${point.fillLevel || 0}%</p>
          </div>
          <div style="margin-bottom: 8px;">
            <p style="font-size: 12px; color: #888;">Dernière collecte</p>
            <p style="font-size: 14px;">${formatDate(point.lastCollection)}</p>
          </div>
          <div>
            <p style="font-size: 12px; color: #888;">Capacité</p>
            <p style="font-size: 14px;">${point.capacity} kg</p>
          </div>
        </div>
      `;

      // Créer et ajouter le marqueur
      const marker = L.marker([point.coordinates[0], point.coordinates[1]], {
        icon: customIcon
      })
      .bindPopup(popupContent)
      .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [collectionPoints, mapLoaded]);

  // Gestion des datasets GeoJSON
  useEffect(() => {
    if (!mapLoaded || !map.current || !datasetLayerRef.current) return;

    // Vider la couche précédente
    datasetLayerRef.current.clearLayers();

    if (datasetGeoJSON && datasetGeoJSON.features.length > 0) {
      // Créer la couche GeoJSON
      const geoJsonLayer = L.geoJSON(datasetGeoJSON, {
        style: (feature) => {
          const geometryType = feature?.geometry.type;
          
          if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
            return {
              color: '#047857',
              weight: 2,
              fillColor: '#059669',
              fillOpacity: 0.3
            };
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return {
              color: '#059669',
              weight: 3,
              opacity: 0.8
            };
          }
          return {};
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#059669',
            color: '#047857',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.8
          });
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            let popupContent = `<div style="padding: 12px; max-width: 250px;">`;
            popupContent += `<h3 style="font-weight: bold; color: #047857; margin-bottom: 8px; font-size: 14px;">${feature.properties.name || 'Élément'}</h3>`;
            
            Object.entries(feature.properties).forEach(([key, value]) => {
              if (value !== null && value !== undefined && key !== 'name' && key !== 'id') {
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                popupContent += `<div style="font-size: 12px; margin-bottom: 4px;"><span style="font-weight: 500; color: #374151;">${displayKey}:</span> <span style="color: #6b7280;">${value}</span></div>`;
              }
            });
            popupContent += `</div>`;

            layer.bindPopup(popupContent);
          }
        }
      });

      datasetLayerRef.current.addLayer(geoJsonLayer);

      // Centrer la carte sur les données
      try {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.warn('Could not fit bounds for dataset:', error);
      }
    }
  }, [datasetGeoJSON, mapLoaded]);

  // Gestion des routes sélectionnées
  useEffect(() => {
    if (!mapLoaded || !map.current || !routeLayerRef.current) return;

    // Vider la couche de route précédente
    routeLayerRef.current.clearLayers();

    if (selectedRoute && selectedRoute.geometry) {
      let routeData = selectedRoute;

      // Si c'est un objet de géométrie simple, l'encapsuler dans un Feature
      if (selectedRoute.geometry && !selectedRoute.type) {
        routeData = {
          type: 'Feature',
          geometry: selectedRoute.geometry,
          properties: selectedRoute.properties || {}
        };
      }

      // Créer la couche de route
      const routeLayer = L.geoJSON(routeData, {
        style: {
          color: '#10B981',
          weight: 4,
          opacity: 0.8
        }
      });

      routeLayerRef.current.addLayer(routeLayer);

      // Centrer sur la route
      try {
        const bounds = routeLayer.getBounds();
        if (bounds.isValid()) {
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.warn('Could not fit bounds for route:', error);
      }
    }
  }, [selectedRoute, mapLoaded]);

  // Gestion des couches personnalisées
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Supprimer les couches personnalisées existantes
    customLayersRef.current.forEach(layerGroup => {
      map.current?.removeLayer(layerGroup);
    });
    customLayersRef.current = [];

    // Ajouter les nouvelles couches
    activeLayers.forEach((layer, index) => {
      if (layer.visible && layer.data) {
        const layerGroup = L.layerGroup();
        
        try {
          const geoJsonLayer = L.geoJSON(layer.data, {
            style: layer.paint || {
              color: '#059669',
              weight: 2,
              opacity: 0.8
            }
          });
          
          layerGroup.addLayer(geoJsonLayer);
          layerGroup.addTo(map.current!);
          customLayersRef.current.push(layerGroup);
        } catch (error) {
          console.warn(`Could not add custom layer ${layer.name}:`, error);
        }
      }
    });
  }, [activeLayers, mapLoaded]);

  // Mise à jour des couches
  useEffect(() => {
    setActiveLayers(layers);
  }, [layers]);

  const handleLayerChange = (updatedLayers: MapLayer[]) => {
    setActiveLayers(updatedLayers);
    onLayerChange?.(updatedLayers);
  };

  return (
    <div className="relative w-full h-full">
      {/* SONAGED Logo Watermark */}
      {showLogo && (
        <div className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center">
          <img 
            src="/SONAGED.png" 
            alt="SONAGED Watermark"
            className="w-[500px] h-[500px] object-contain opacity-5"
          />
        </div>
      )}

      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Panneau de contrôle des couches */}
      {activeLayers.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-[1000]">
          <h3 className="font-semibold text-gray-800 mb-3">Couches</h3>
          {activeLayers.map((layer, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={(e) => {
                  const updatedLayers = [...activeLayers];
                  updatedLayers[index] = { ...layer, visible: e.target.checked };
                  handleLayerChange(updatedLayers);
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{layer.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Légende personnalisée */}
      {showLegend && activeLayers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-[1000]">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Légende</h3>
          {activeLayers.filter(layer => layer.visible).map((layer, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ 
                  backgroundColor: layer.paint?.color || layer.paint?.fillColor || '#059669'
                }}
              />
              <span className="text-xs text-gray-700">{layer.name}</span>
            </div>
          ))}
          {/* Légende pour les points de collecte */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 text-xs mb-2">Points de collecte</h4>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span className="text-xs text-gray-600">&lt; 30%</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              <span className="text-xs text-gray-600">30-70%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <span className="text-xs text-gray-600">&gt; 70%</span>
            </div>
          </div>
        </div>
      )}

      {/* Flèche du Nord */}
      {showNorthArrow && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex flex-col items-center">
            <div className="text-xl font-bold text-gray-800">↑</div>
            <div className="text-xs text-gray-600">N</div>
          </div>
        </div>
      )}
      
      {showLogo && (
        <div className="absolute bottom-8 right-8 bg-white p-2 rounded-lg shadow-md z-[1000]">
          <img src="/logo_siteWeb-3.png" alt="SONAGED" className="h-12 w-auto" />
        </div>
      )}

      {/* Indicateur de chargement */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* CSS pour les marqueurs personnalisés */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-collection-marker {
            background: transparent !important;
            border: none !important;
          }
        `
      }} />
    </div>
  );
};

export default MapView;