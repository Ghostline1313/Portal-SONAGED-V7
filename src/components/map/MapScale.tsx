import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

const MapScale = () => {
  const map = useMap();
  const [scale, setScale] = useState('');

  useEffect(() => {
    const updateScale = () => {
      const bounds = map.getBounds();
      const center = bounds.getCenter();
      const point1 = map.latLngToContainerPoint(center);
      const point2 = point1.add([100, 0]);
      const latLng2 = map.containerPointToLatLng(point2);
      const meters = center.distanceTo(latLng2);
      
      if (meters >= 1000) {
        setScale(`${(meters / 1000).toFixed(1)} km`);
      } else {
        setScale(`${Math.round(meters)} m`);
      }
    };

    map.on('zoomend', updateScale);
    updateScale();

    return () => {
      map.off('zoomend', updateScale);
    };
  }, [map]);

  return (
    <div className="absolute bottom-8 left-8 bg-white px-3 py-1.5 rounded shadow-md z-[1000]">
      <div className="text-xs text-gray-600">Échelle approximative</div>
      <div className="flex items-center mt-1">
        <div className="w-[100px] h-1 bg-gray-800" />
        <span className="ml-2 text-sm font-medium">{scale}</span>
      </div>
    </div>
  );
};

export default MapScale;