import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import shp from "shpjs";
import JSZip from "jszip";
import { db, supabase, uploadWholeGeoJSON, uploadRawFile } from "../lib/supabase";
import {
  Download,
  Filter,
  Search,
  Database,
  Map as MapIcon,
  Truck,
  Trash2,
  Plus,
  Calendar,
  FileType2,
  User,
  ChevronDown,
  Upload,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

type DatasetMetadata = {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  lastUpdated: string;
  format: string;
  owner: string;
  tags: string[];
  fileUrl?: string;
};

const mockDatasets: DatasetMetadata[] = [
  {
    id: '1',
    name: 'Points de collecte Dakar',
    description: 'Localisation de tous les points de collecte des déchets dans la région de Dakar',
    category: 'Points d\'intérêt',
    source: 'Sonaged',
    lastUpdated: '2025-03-10',
    format: 'GeoJSON',
    owner: 'Direction technique',
    tags: ['collecte', 'conteneurs', 'bacs'],
  },
  {
    id: '2',
    name: 'Circuits de collecte 2025',
    description: 'Tracés des circuits de collecte des déchets pour l\'année 2025',
    category: 'Itinéraires',
    source: 'Département Logistique',
    lastUpdated: '2025-02-15',
    format: 'SHP',
    owner: 'Service Logistique',
    tags: ['circuits', 'itinéraires', 'collecte'],
  },
  {
    id: '3',
    name: 'Zones de couverture',
    description: 'Zones géographiques de couverture des services de collecte',
    category: 'Zonage',
    source: 'Direction Aménagement',
    lastUpdated: '2025-01-25',
    format: 'SHP',
    owner: 'Service SIG',
    tags: ['zones', 'couverture', 'aménagement'],
  },
  {
    id: '4',
    name: 'Données population 2024',
    description: 'Densité de population par quartier pour l\'année 2024',
    category: 'Statistiques',
    source: 'Agence Nationale de la Statistique',
    lastUpdated: '2024-12-05',
    format: 'CSV',
    owner: 'Service Planification',
    tags: ['population', 'densité', 'quartiers'],
  }
];

const DataCatalog = () => {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadType, setUploadType] = useState<"SHP" | "CSV" | "PDF" | "GeoJSON" | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shpDebugFileList, setShpDebugFileList] = useState<string[] | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Récupère les datasets des différentes tables (mock, collection_points, geojson_datasets, raw_files)
  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const datasetsList: DatasetMetadata[] = [...mockDatasets];

      // collection_points (GeoJSON éclaté)
      const { data: cpData } = await db.collectionPoints.getAll();
      if (cpData) {
        datasetsList.push(...cpData.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          category: d.type || "Importé",
          source: "Supabase",
          lastUpdated: d.updated_at || "",
          format: "GeoJSON",
          owner: "Utilisateur actuel",
          tags: [],
        })));
      }

      // geojson_datasets (GeoJSON brut, 1 fichier = 1 ligne)
      const { data: geojsonDatasets } = await supabase.from("geojson_datasets").select("*");
      if (geojsonDatasets) {
        datasetsList.push(...geojsonDatasets.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          category: "GeoJSON brut",
          source: "Supabase",
          lastUpdated: d.updated_at || "",
          format: "GeoJSON",
          owner: "Utilisateur actuel",
          tags: [],
        })));
      }

      // raw_files (SHP/CSV/PDF bruts)
      const { data: rawFiles } = await supabase.from("raw_files").select("*");
      if (rawFiles) {
        datasetsList.push(...rawFiles.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          category: "Fichier brut",
          source: "Supabase",
          lastUpdated: d.updated_at || "",
          format: d.filetype ? d.filetype.toUpperCase() : "FICHIER",
          owner: "Utilisateur actuel",
          tags: [],
          fileUrl: undefined // à gérer si tu utilises Supabase Storage pour les fichiers volumineux
        })));
      }

      setDatasets(datasetsList);
    } catch (error) {
      setDatasets(mockDatasets);
    }
    setIsLoading(false);
  };

  const resetUploadForm = () => {
    setUploadType(null);
    setUploadFile(null);
    setUploadName("");
    setUploadDescription("");
    setUploadStatus(null);
    setUploadError(null);
    setIsUploading(false);
    setShpDebugFileList(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadType === 'SHP' && !file.name.endsWith('.zip')) {
        setUploadError('Pour les fichiers SHP, veuillez fournir un fichier ZIP contenant tous les composants du Shapefile (.shp, .shx, .dbf).');
        return;
      }
      setUploadFile(file);
      setUploadError(null);
    }
  };

  // Handler d'upload : stocke GeoJSON entier ou fichiers bruts selon le type
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadType || !uploadFile || !uploadName) {
      setUploadError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setIsUploading(true);
    setUploadStatus("Traitement en cours...");
    setUploadError(null);
    setShpDebugFileList(null);

    try {
      if (uploadType === "GeoJSON") {
        const text = await uploadFile.text();
        const geojson = JSON.parse(text);
        // Stocke l'objet complet dans geojson_datasets
        const { error } = await uploadWholeGeoJSON(geojson, uploadName, uploadDescription);
        if (error) throw error;
      } else if (uploadType === "SHP" || uploadType === "CSV" || uploadType === "PDF") {
        // Stocke le fichier binaire (ZIP, CSV, PDF) dans raw_files
        const { error } = await uploadRawFile(uploadFile, uploadName, uploadDescription, uploadType.toLowerCase());
        if (error) throw error;
      } else {
        setUploadError("Type de fichier non supporté.");
        setIsUploading(false);
        return;
      }

      setUploadStatus("Upload réussi !");
      await fetchDatasets();
      setTimeout(() => {
        setShowAddModal(false);
        resetUploadForm();
      }, 2000);
    } catch (err: any) {
      setUploadError("Erreur lors de l'upload : " + (err.message || "Erreur inconnue"));
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  // PATCH : handleVisualiser gère tous les formats, y compris SHP et CSV
  const handleVisualiser = async (dataset: DatasetMetadata) => {
    try {
      let datasetGeoJSON = null;

      // 1. GeoJSON éclaté (collection_points)
      if (dataset.format === "GeoJSON" && dataset.source === "Supabase" && dataset.category !== "GeoJSON brut") {
        const { data, error } = await db.collectionPoints.getById(dataset.id);
        if (!error && data) {
          datasetGeoJSON = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [data.longitude, data.latitude]
                },
                properties: {
                  id: data.id,
                  name: data.name,
                  type: data.type,
                  commune_id: data.commune_id,
                  capacity_kg: data.capacity_kg,
                  waste_type: data.waste_type,
                  status: data.status
                }
              }
            ]
          };
        }
      }
      // 2. GeoJSON brut
      else if (dataset.format === "GeoJSON" && dataset.category === "GeoJSON brut") {
        const { data, error } = await supabase.from("geojson_datasets").select("data").eq("id", dataset.id).single();
        if (!error && data) {
          datasetGeoJSON = data.data;
        }
      }
      // 3. SHP (raw_files)
      else if (dataset.format === "SHP" && dataset.category === "Fichier brut") {
        const { data, error } = await supabase.from("raw_files").select("filename, filedata").eq("id", dataset.id).single();
        if (!error && data?.filedata) {
          const blob = new Blob([new Uint8Array(data.filedata)], { type: "application/zip" });
          try {
            datasetGeoJSON = await shp(blob);
          } catch (e) {
            alert("Erreur lors de la conversion du SHP en GeoJSON.");
            return;
          }
        }
      }
      // 4. CSV (raw_files)
      else if (dataset.format === "CSV" && dataset.category === "Fichier brut") {
        const { data, error } = await supabase.from("raw_files").select("filename, filedata").eq("id", dataset.id).single();
        if (!error && data?.filedata) {
          const blob = new Blob([new Uint8Array(data.filedata)], { type: "text/csv" });
          const text = await blob.text();
          const result = Papa.parse(text, { header: true });
          if (result.data && Array.isArray(result.data)) {
            datasetGeoJSON = {
              type: "FeatureCollection",
              features: result.data
                .filter((row: any) => row.longitude && row.latitude)
                .map((row: any) => ({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
                  },
                  properties: row
                }))
            };
          }
        }
      }
      // 5. Mock/fallback
      else if (dataset.format === "GeoJSON" && dataset.source !== "Supabase") {
        datasetGeoJSON = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: { type: "Point", coordinates: [-17.4441, 14.6928] },
            properties: { name: dataset.name, description: dataset.description, category: dataset.category }
          }]
        };
      }

      if (!datasetGeoJSON) {
        alert("Impossible de visualiser ce format ou données absentes.");
        return;
      }

      navigate('/map', {
        state: {
          dataset,
          datasetGeoJSON,
          focusedDataset: dataset
        }
      });
    } catch (error) {
      console.error('Erreur lors de la visualisation:', error);
      alert('Erreur lors du chargement des données pour la visualisation');
    }
  };

  const handleDownload = async (dataset: DatasetMetadata) => {
    // Pour les fichiers bruts (PDF, ZIP, CSV) en raw_files
    if ((dataset.format === "PDF" || dataset.format === "SHP" || dataset.format === "CSV") && dataset.category === "Fichier brut") {
      const { data, error } = await supabase.from("raw_files").select("filename, filedata").eq("id", dataset.id).single();
      if (!error && data && data.filedata) {
        const blob = new Blob([new Uint8Array(data.filedata)], { type: dataset.format === "PDF" ? "application/pdf" : dataset.format === "SHP" ? "application/zip" : "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename || "fichier";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Impossible de télécharger le fichier.");
      }
    }
    // Pour GeoJSON brut
    else if (dataset.format === "GeoJSON" && dataset.category === "GeoJSON brut") {
      const { data, error } = await supabase.from("geojson_datasets").select("data, name").eq("id", dataset.id).single();
      if (!error && data && data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.name?.replace(/\s+/g, "_") || "dataset"}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    // Pour collection_points (GeoJSON éclaté)
    else if (dataset.format === "GeoJSON" && dataset.source === "Supabase" && dataset.category !== "GeoJSON brut") {
      const { data, error } = await db.collectionPoints.getById(dataset.id);
      if (!error && data) {
        const geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [data.longitude, data.latitude]
              },
              properties: data
            }
          ]
        };
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataset.name.replace(/\s+/g, "_")}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    // Pour mock datasets
    else if (dataset.fileUrl) {
      window.open(dataset.fileUrl, "_blank");
    }
    else {
      alert("Téléchargement non disponible pour ce format.");
    }
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      searchQuery === "" ||
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFormat = selectedFormat === null || dataset.format === selectedFormat;
    const matchesCategory = selectedCategory === null || dataset.category === selectedCategory;
    return matchesSearch && matchesFormat && matchesCategory;
  });

  const uniqueFormats = Array.from(new Set(datasets.map((dataset) => dataset.format)));
  const uniqueCategories = Array.from(new Set(datasets.map((dataset) => dataset.category)));

  const formatIcon = (format: string) => {
    switch (format) {
      case 'SHP':
        return <MapIcon size={16} className="text-green-500" />;
      case 'GeoJSON':
        return <Database size={16} className="text-green-500" />;
      case 'CSV':
        return <FileType2 size={16} className="text-green-500" />;
      case 'PDF':
        return <FileType2 size={16} className="text-red-500" />;
      default:
        return <FileType2 size={16} className="text-gray-500" />;
    }
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case 'Points d\'intérêt':
        return <MapIcon size={16} className="text-green-600" />;
      case 'Itinéraires':
        return <Truck size={16} className="text-green-600" />;
      case 'Zonage':
        return <MapIcon size={16} className="text-green-600" />;
      case 'Statistiques':
        return <Database size={16} className="text-green-600" />;
      default:
        return <Database size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-600">Catalogue de données</h1>
        <button 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} className="mr-1.5" />
          Ajouter un jeu de données
        </button>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Ajouter un jeu de données</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetUploadForm();
                }}
                className="text-gray-400 hover:text-gray-500"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!uploadType ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadType('SHP')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <MapIcon size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">Shapefile (.shp)</span>
                    <span className="block text-xs text-gray-500 mt-1">Fichier ZIP requis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('GeoJSON')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Database size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">GeoJSON (.geojson)</span>
                    <span className="block text-xs text-gray-500 mt-1">Données géographiques</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('CSV')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <FileType2 size={24} className="mx-auto mb-2 text-green-600" />
                    <span className="block text-sm font-medium">CSV (.csv)</span>
                    <span className="block text-xs text-gray-500 mt-1">Données tabulaires</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('PDF')}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <FileType2 size={24} className="mx-auto mb-2 text-red-600" />
                    <span className="block text-sm font-medium">PDF (.pdf)</span>
                    <span className="block text-xs text-gray-500 mt-1">Documents</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du jeu de données *
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichier ({uploadType}) *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                            <span>Téléverser un fichier</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept={uploadType === 'PDF' ? '.pdf' : uploadType === 'CSV' ? '.csv' : uploadType === 'GeoJSON' ? '.geojson,.json' : '.zip'}
                              onChange={handleFileUpload}
                              required
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                        {uploadFile ? (
                          <p className="text-sm text-green-600 font-medium">{uploadFile.name}</p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {uploadType === 'SHP' 
                              ? 'Glissez-déposez un fichier ZIP ou cliquez pour sélectionner'
                              : 'Glissez-déposez ou cliquez pour sélectionner'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Debug list for SHP zip content */}
                  {uploadType === "SHP" && shpDebugFileList && (
                    <div className="p-2 bg-yellow-50 rounded text-xs mt-2">
                      <strong>Fichiers trouvés dans le ZIP :</strong>
                      <ul className="list-disc list-inside">
                        {shpDebugFileList.map(f => <li key={f}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {uploadStatus && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-md">
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700">{uploadStatus}</span>
                    </div>
                  )}
                  {uploadError && (
                    <div className="flex items-center p-3 bg-red-50 rounded-md">
                      <AlertCircle size={16} className="text-red-500 mr-2" />
                      <span className="text-sm text-red-700">{uploadError}</span>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setUploadType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                      disabled={isUploading}
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importation...
                        </>
                      ) : (
                        'Importer'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Rechercher un jeu de données..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <div className="relative w-40">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                value={selectedFormat || ''}
                onChange={(e) => setSelectedFormat(e.target.value || null)}
              >
                <option value="">Tous formats</option>
                {uniqueFormats.map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>
            <div className="relative w-52">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">Toutes catégories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 flex items-center">
              <Filter size={16} className="mr-1.5" />
              Plus de filtres
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement des données...</div>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <Trash2 size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun jeu de données trouvé</h3>
            <p className="text-gray-500 text-center max-w-md">
              Aucun jeu de données ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Format
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Propriétaire
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDatasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                          <Database size={20} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-green-600">{dataset.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{dataset.description}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dataset.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">{categoryIcon(dataset.category)}</div>
                        <div className="text-sm text-green-600">{dataset.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">{formatIcon(dataset.format)}</div>
                        <div className="text-sm text-green-600">{dataset.format}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-green-500 mr-2" />
                        <div className="text-sm text-green-600">{dataset.lastUpdated}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-green-500 mr-2" />
                        <div className="text-sm text-green-600">{dataset.owner}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-green-600 hover:text-green-700 mr-3"
                        onClick={() => handleVisualiser(dataset)}
                      >
                        Visualiser
                      </button>
                      <button
                        className="text-green-600 hover:text-green-700 flex items-center inline-flex"
                        onClick={() => handleDownload(dataset)}
                      >
                        <Download size={16} className="mr-1" />
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCatalog;