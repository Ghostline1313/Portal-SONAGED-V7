import { useState } from 'react';
import { MapPin, Plus, Search, Filter, Calendar, PenTool as Tool, AlertTriangle, Trash2 } from 'lucide-react';

interface UrbanFurniture {
  id: string;
  type: 'PRN' | 'BAC_RUE' | 'POINT_PROPRE';
  location: string;
  installDate: string;
  lastMaintenance: string;
  status: 'good' | 'needs-maintenance' | 'damaged';
  description: string;
  capacity: number;
  fillLevel?: number;
}

const mockFurniture: UrbanFurniture[] = [
  {
    id: '1',
    type: 'PRN',
    location: 'Place de l\'Indépendance',
    installDate: '2024-06-15',
    lastMaintenance: '2025-02-20',
    status: 'good',
    description: 'Point de Regroupement Normalisé - Zone Centre',
    capacity: 1000,
    fillLevel: 45,
  },
  {
    id: '2',
    type: 'BAC_RUE',
    location: 'Avenue Léopold Sédar Senghor',
    installDate: '2024-07-01',
    lastMaintenance: '2025-03-01',
    status: 'needs-maintenance',
    description: 'Bac de rue tri sélectif',
    capacity: 240,
    fillLevel: 80,
  },
  {
    id: '3',
    type: 'POINT_PROPRE',
    location: 'Boulevard de la République',
    installDate: '2024-05-10',
    lastMaintenance: '2025-03-10',
    status: 'damaged',
    description: 'Point propre avec conteneurs enterrés',
    capacity: 5000,
    fillLevel: 65,
  },
];

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'PRN':
      return 'Point de Regroupement Normalisé';
    case 'BAC_RUE':
      return 'Bac de rue';
    case 'POINT_PROPRE':
      return 'Point propre';
    default:
      return type;
  }
};

const UrbanFurniture = () => {
  const [furniture] = useState<UrbanFurniture[]>(mockFurniture);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Bon état';
      case 'needs-maintenance':
        return 'Maintenance requise';
      case 'damaged':
        return 'Endommagé';
      default:
        return status;
    }
  };

  const filteredFurniture = furniture.filter((item) => {
    const matchesSearch = 
      getTypeLabel(item.type).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-green-600">Mobilier urbain</h1>
        <button className="btn-primary flex items-center">
          <Plus size={16} className="mr-1.5" />
          Ajouter un équipement
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Rechercher par type, localisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedType === 'all'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('all')}
            >
              Tous les types
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedType === 'PRN'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('PRN')}
            >
              PRN
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedType === 'BAC_RUE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('BAC_RUE')}
            >
              Bacs de rue
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedType === 'POINT_PROPRE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('POINT_PROPRE')}
            >
              Points propres
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedStatus === 'all'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('all')}
            >
              Tous les états
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedStatus === 'good'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('good')}
            >
              Bon état
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedStatus === 'needs-maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('needs-maintenance')}
            >
              Maintenance
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedStatus === 'damaged'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('damaged')}
            >
              Endommagé
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFurniture.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-green-600">{getTypeLabel(item.type)}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  {item.location}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Trash2 size={16} className="text-gray-400 mr-2" />
                  <span>Capacité: {item.capacity} L</span>
                </div>
                {item.fillLevel !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Niveau de remplissage</span>
                      <span>{item.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.fillLevel}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span>Installation: {new Date(item.installDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Tool size={16} className="text-gray-400 mr-2" />
                  <span>Dernière maintenance: {new Date(item.lastMaintenance).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700">
                <MapPin size={16} className="mr-1.5" />
                Voir sur la carte
              </button>
              {item.status !== 'good' && (
                <button className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                  <AlertTriangle size={16} className="mr-1.5" />
                  Signaler un problème
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrbanFurniture;