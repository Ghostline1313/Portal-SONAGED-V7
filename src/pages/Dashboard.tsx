import { useEffect, useState } from 'react';
import { 
  Truck, 
  Recycle, 
  Map as MapIcon, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Database,
  Download,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { saveAs } from 'file-saver';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const wasteCollectionData = [
    { month: 'Jan', recyclable: 400, general: 240, organic: 180 },
    { month: 'Fév', recyclable: 380, general: 238, organic: 190 },
    { month: 'Mar', recyclable: 450, general: 245, organic: 210 },
    { month: 'Avr', recyclable: 470, general: 250, organic: 220 },
    { month: 'Mai', recyclable: 540, general: 255, organic: 250 },
    { month: 'Juin', recyclable: 580, general: 260, organic: 270 },
  ];

  const wasteTypeData = [
    { name: 'Général', value: 38, color: '#94a3b8' },
    { name: 'Recyclable', value: 42, color: '#10b981' },
    { name: 'Organique', value: 15, color: '#f59e0b' },
    { name: 'Dangereux', value: 5, color: '#ef4444' },
  ];

  const kpiCards = [
    {
      title: 'Points de collecte',
      value: '324',
      change: '+12',
      icon: MapIcon,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Collecte (tonnes/mois)',
      value: '1,256',
      change: '+5.3%',
      icon: Truck,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Taux de recyclage',
      value: '42%',
      change: '+3.2%',
      icon: Recycle,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Équipements actifs',
      value: '86',
      change: '98%',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
  ];

  const alerts = [
    {
      id: 1,
      title: 'Conteneur presque plein',
      location: 'Avenue Léopold Sédar Senghor',
      level: '90%',
      time: 'Il y a 1 heure',
    },
    {
      id: 2,
      title: 'Collecte manquée',
      location: 'Quartier Sacré-Cœur',
      level: 'Critique',
      time: 'Il y a 5 heures',
    },
    {
      id: 3,
      title: 'Véhicule en maintenance',
      location: 'Camion #37',
      level: 'Modéré',
      time: 'Aujourd\'hui',
    },
  ];

  const exportToCSV = () => {
    // Convert data to CSV format
    const csvData = wasteCollectionData.map(row => 
      `${row.month},${row.recyclable},${row.general},${row.organic}`
    ).join('\n');
    
    const header = 'Mois,Recyclable,General,Organique\n';
    const blob = new Blob([header + csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'statistiques_dechets.csv');
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    // Create PDF content
    const content = wasteCollectionData.map(row => 
      `${row.month}: Recyclable: ${row.recyclable}, General: ${row.general}, Organique: ${row.organic}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'application/pdf' });
    saveAs(blob, 'statistiques_dechets.pdf');
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-green-600">Tableau de bord</h1>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
            <option>Cette année</option>
          </select>
          <div className="relative">
            <button 
              className="btn-outline flex items-center"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={16} className="mr-1.5" />
              Exporter
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={exportToCSV}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText size={16} className="mr-2" />
                  Exporter en CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText size={16} className="mr-2" />
                  Exporter en PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{card.value}</p>
              </div>
              <div className={card.color + " p-2 rounded-lg"}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm">
              <ArrowUpRight size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{card.change}</span>
              <span className="text-gray-500 ml-1">vs mois précédent</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card col-span-2 p-5">
          <h2 className="text-lg font-medium mb-4 text-green-600">Évolution des collectes</h2>
          <div className="h-72">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Chargement des données...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteCollectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="recyclable" name="Recyclable" stackId="a" fill="#10b981" />
                  <Bar dataKey="general" name="Général" stackId="a" fill="#94a3b8" />
                  <Bar dataKey="organic" name="Organique" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-medium mb-4 text-green-600">Répartition des déchets</h2>
          <div className="h-72">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Chargement des données...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {wasteTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-green-600">Alertes récentes</h2>
            <Link to="/alerts" className="text-sm text-green-600 hover:text-green-700">
              Voir toutes les alertes
            </Link>
          </div>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="mr-3 mt-1">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-green-600">{alert.title}</p>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      {alert.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-medium mb-4 text-green-600">Accès rapide</h2>
          <div className="space-y-2">
            <Link
              to="/map"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="p-2 bg-green-100 rounded mr-3">
                <MapIcon size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-600">Carte interactive</p>
                <p className="text-sm text-gray-600">Visualiser les points de collecte</p>
              </div>
            </Link>
            <Link
              to="/data"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="p-2 bg-green-100 rounded mr-3">
                <Database size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-600">Catalogue de données</p>
                <p className="text-sm text-gray-600">Accéder aux jeux de données</p>
              </div>
            </Link>
            <Link
              to="/routes"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="p-2 bg-green-100 rounded mr-3">
                <Truck size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-600">Circuits de collecte</p>
                <p className="text-sm text-gray-600">Optimiser les itinéraires</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;