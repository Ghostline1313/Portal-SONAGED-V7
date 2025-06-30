import { useState, useEffect } from 'react';
import { Map, Calendar, Clock, Users, Brush, Plus, MapPin, ArrowRight } from 'lucide-react';
import { SweepingRoute } from '../types';
import { useNavigate } from 'react-router-dom';

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][] | number[][][] | number[][][][];
  };
  properties: {
    Id: number;
    code: string;
    nomcircuit: string;
    region: string;
    dept: string;
    commune: string;
    shift: string;
    longueur: number;
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

const SweepingRoutes = () => {
  const [routes, setRoutes] = useState<SweepingRoute[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load the GeoJSON data from the local file
    fetch('/src/data/Circuit_Balayage_Mermoz_Sacré-Coeur.json')
      .then(response => response.json())
      .then((data: GeoJSONData) => {
        const transformedRoutes = data.features
          .filter(feature => feature.properties.nomcircuit) // Only include routes with names
          .map(feature => ({
            id: String(feature.properties.Id || Math.random()),
            code: feature.properties.code || '',
            name: feature.properties.nomcircuit,
            region: feature.properties.region || 'Dakar',
            department: feature.properties.dept || 'Dakar',
            commune: feature.properties.commune,
            shift: feature.properties.shift || 'Matin',
            length: feature.properties.longueur * 1000, // Convert to meters
            geometry: feature.geometry,
          }));
        setRoutes(transformedRoutes);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading sweeping routes:', error);
        setIsLoading(false);
      });
  }, []);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchQuery === '' || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.commune.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesShift = selectedFilter === 'all' || route.shift.toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesShift;
  });

  const formatLength = (length: number) => {
    if (length >= 1000) {
      return `${(length / 1000).toFixed(2)} km`;
    }
    return `${Math.round(length)} m`;
  };

  const estimateTime = (length: number) => {
    // Rough estimation: 1km = 15 minutes
    const minutes = Math.round((length / 1000) * 15);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
    }
    return `${minutes} min`;
  };

  const handleViewOnMap = (route: SweepingRoute) => {
    // Store the selected route in sessionStorage
    sessionStorage.setItem('selectedRoute', JSON.stringify(route));
    // Navigate to the map view
    navigate('/map');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-green-600">Circuits de balayage</h1>
        <button className="btn-primary flex items-center bg-green-600 hover:bg-green-700">
          <Plus size={16} className="mr-1.5" />
          Nouveau circuit
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <input
              type="text"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Rechercher un circuit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFilter === 'all'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              Tous les circuits
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFilter === 'matin'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('matin')}
            >
              Équipe matin
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFilter === 'soir'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('soir')}
            >
              Équipe soir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="text-gray-500">Chargement des circuits...</div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8">
            <Brush size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun circuit trouvé</h3>
            <p className="text-gray-500 text-center max-w-md">
              Aucun circuit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
            </p>
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-600 line-clamp-2">{route.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {route.commune}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap ml-2">
                  {route.shift === 'matin' ? 'Équipe matin' : 'Équipe soir'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Map size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span>Longueur: {formatLength(route.length)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span>Durée estimée: {estimateTime(route.length)}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Users size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span>Équipe: {route.shift === 'matin' ? 'Matin' : 'Soir'}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Brush size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span>Zone: {route.commune}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700"
                  onClick={() => handleViewOnMap(route)}
                >
                  <Map size={16} className="mr-1.5" />
                  Voir sur la carte
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SweepingRoutes;