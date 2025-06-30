import { useState } from 'react';
import { FileImage, Move, Maximize, Type, Image as ImageIcon, Compass, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface MapExportProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: MapExportConfig) => void;
}

export interface MapExportConfig {
  title: string;
  description?: string;
  format: 'png' | 'jpg';
  width: number;
  height: number;
  dpi: number;
  showLegend: boolean;
  showNorthArrow: boolean;
  showScale: boolean;
  showLogo: boolean;
  orientation: 'portrait' | 'landscape';
  captureSize: 'A4' | 'A3' | 'custom';
}

const CAPTURE_SIZES = {
  A4: {
    portrait: { width: 2480, height: 3508 }, // A4 at 300 DPI
    landscape: { width: 3508, height: 2480 },
  },
  A3: {
    portrait: { width: 3508, height: 4961 }, // A3 at 300 DPI
    landscape: { width: 4961, height: 3508 },
  },
};

const MapExport = ({ isOpen, onClose }: MapExportProps) => {
  const [config, setConfig] = useState<MapExportConfig>({
    title: 'Carte',
    description: '',
    format: 'png',
    width: CAPTURE_SIZES.A4.landscape.width,
    height: CAPTURE_SIZES.A4.landscape.height,
    dpi: 300,
    showLegend: true,
    showNorthArrow: true,
    showScale: true,
    showLogo: true,
    orientation: 'landscape',
    captureSize: 'A4',
  });

  const handleExport = async () => {
    try {
      const mapContainer = document.querySelector('.leaflet-container');
      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      // Wait for any pending map renders
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a clone of the map for export
      const exportContainer = mapContainer.cloneNode(true) as HTMLElement;
      exportContainer.style.width = `${config.width}px`;
      exportContainer.style.height = `${config.height}px`;
      
      // Temporarily append to document for capture
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      document.body.appendChild(exportContainer);

      const canvas = await html2canvas(exportContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: config.dpi / 96,
        logging: false,
        width: config.width,
        height: config.height,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedMap = clonedDoc.querySelector('.leaflet-container');
          if (clonedMap) {
            (clonedMap as HTMLElement).style.width = `${config.width}px`;
            (clonedMap as HTMLElement).style.height = `${config.height}px`;
          }
        }
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Use FileSaver to handle the download
          const fileName = `${config.title || 'carte'}_${new Date().toISOString().split('T')[0]}.${config.format}`;
          saveAs(blob, fileName);
        }
      }, `image/${config.format}`, 1.0);

      // Cleanup
      document.body.removeChild(exportContainer);
    } catch (error) {
      console.error('Error during map export:', error);
    }
    
    onClose();
  };

  const handleCaptureSizeChange = (size: 'A4' | 'A3' | 'custom') => {
    if (size === 'custom') {
      setConfig({ ...config, captureSize: size });
      return;
    }

    const dimensions = CAPTURE_SIZES[size][config.orientation];
    setConfig({
      ...config,
      captureSize: size,
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
    if (config.captureSize === 'custom') {
      setConfig({ ...config, orientation });
      return;
    }

    const dimensions = CAPTURE_SIZES[config.captureSize][orientation];
    setConfig({
      ...config,
      orientation,
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Configuration de la capture</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la carte
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format de capture
              </label>
              <select
                value={config.captureSize}
                onChange={(e) => handleCaptureSizeChange(e.target.value as 'A4' | 'A3' | 'custom')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                value={config.orientation}
                onChange={(e) => handleOrientationChange(e.target.value as 'portrait' | 'landscape')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format d'export
              </label>
              <select
                value={config.format}
                onChange={(e) => setConfig({ ...config, format: e.target.value as 'png' | 'jpg' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résolution (DPI)
              </label>
              <select
                value={config.dpi}
                onChange={(e) => setConfig({ ...config, dpi: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="72">72 DPI</option>
                <option value="150">150 DPI</option>
                <option value="300">300 DPI</option>
              </select>
            </div>
          </div>

          {config.captureSize === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largeur (px)
                </label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hauteur (px)
                </label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => setConfig({ ...config, height: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Éléments de la carte
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showLegend}
                  onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Type size={16} className="ml-2 mr-1.5 text-gray-500" />
                <span className="text-sm text-gray-700">Légende</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showNorthArrow}
                  onChange={(e) => setConfig({ ...config, showNorthArrow: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Compass size={16} className="ml-2 mr-1.5 text-gray-500" />
                <span className="text-sm text-gray-700">Flèche du Nord</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showScale}
                  onChange={(e) => setConfig({ ...config, showScale: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Maximize size={16} className="ml-2 mr-1.5 text-gray-500" />
                <span className="text-sm text-gray-700">Échelle</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showLogo}
                  onChange={(e) => setConfig({ ...config, showLogo: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <ImageIcon size={16} className="ml-2 mr-1.5 text-gray-500" />
                <span className="text-sm text-gray-700">Logo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-gray-50 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            <FileImage size={16} className="mr-1.5" />
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapExport;