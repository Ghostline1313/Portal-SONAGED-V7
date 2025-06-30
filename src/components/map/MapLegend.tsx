import { useEffect, useState } from 'react';
import { MapLayer } from '../../types';

interface MapLegendProps {
  layers: MapLayer[];
}

const MapLegend = ({ layers }: MapLegendProps) => {
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>([]);

  useEffect(() => {
    setActiveLayers(layers.filter(layer => layer.visible));
  }, [layers]);

  if (activeLayers.length === 0) return null;

  return (
    <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-md z-[1000] min-w-[200px]">
      <h3 className="text-sm font-medium mb-2">Légende</h3>
      <div className="space-y-2">
        {activeLayers.map(layer => (
          <div key={layer.id} className="flex items-center text-sm">
            <div 
              className="w-4 h-4 rounded mr-2"
              style={{
                backgroundColor: layer.style?.color || '#4A5568',
                opacity: layer.opacity
              }}
            />
            <span>{layer.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;