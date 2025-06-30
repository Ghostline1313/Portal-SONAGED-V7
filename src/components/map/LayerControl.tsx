import { useState } from 'react';
import { Layers, Eye, EyeOff, X, Filter, Download } from 'lucide-react';
import { MapLayer } from '../../types';

// Mock layer data
const mockLayers: MapLayer[] = [
  {
    id: '1',
    name: 'Points de collecte',
    type: 'point',
    source: 'waste_collection_points',
    visible: true,
    opacity: 1,
  },
  {
    id: '2',
    name: 'Circuits de collecte',
    type: 'line',
    source: 'waste_collection_routes',
    visible: true,
    opacity: 0.8,
  },
  {
    id: '3',
    name: 'Zones de couverture',
    type: 'polygon',
    source: 'coverage_areas',
    visible: false,
    opacity: 0.6,
  },
  {
    id: '4',
    name: 'Densité de population',
    type: 'raster',
    source: 'population_density',
    visible: false,
    opacity: 0.7,
  },
];

interface LayerControlProps {
  onLayerChange?: (layers: MapLayer[]) => void;
}

const LayerControl = ({ onLayerChange }: LayerControlProps) => {
  const [layers, setLayers] = useState<MapLayer[]>(mockLayers);
  const [isOpen, setIsOpen] = useState(true);
  
  const handleVisibilityToggle = (layerId: string) => {
    const updatedLayers = layers.map((layer) => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    
    setLayers(updatedLayers);
    if (onLayerChange) onLayerChange(updatedLayers);
  };

  if (!isOpen) {
    return (
      <button
        className="absolute z-10 top-3 right-3 bg-white p-2 rounded-full shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Layers size={20} className="text-gray-700" />
      </button>
    );
  }

  return (
    <div className="absolute z-10 top-3 right-3 w-64 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center">
          <Layers size={18} className="text-primary-600 mr-2" />
          <h3 className="font-medium">Couches</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Filter size={16} className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-700">Filtres</span>
          </div>
          <button className="text-xs text-primary-600 hover:text-primary-700">
            Réinitialiser
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300">
            Tous
          </button>
          <button className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-md">
            Points
          </button>
          <button className="px-2 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300">
            Lignes
          </button>
          <button className="px-2 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300">
            Polygones
          </button>
        </div>
      </div>
      
      <div className="max-h-72 overflow-y-auto">
        {layers.map((layer) => (
          <div 
            key={layer.id}
            className="p-3 border-b border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => handleVisibilityToggle(layer.id)}
                  className={`p-1 rounded-full mr-2 ${
                    layer.visible ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span className="text-sm font-medium">{layer.name}</span>
              </div>
              <div className="flex items-center">
                <Download size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </div>
            </div>
            
            {layer.visible && (
              <div className="mt-2 pl-7">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 w-14">Opacité:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity}
                    className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none"
                  />
                  <span className="text-xs text-gray-600 ml-2 w-7">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 text-center">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ajouter une couche
        </button>
      </div>
    </div>
  );
};

export default LayerControl;