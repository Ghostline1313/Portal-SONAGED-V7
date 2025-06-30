/**
 * Application principale du Geoportail SONAGED
 * Gère le routage et l'authentification des utilisateurs
 */
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import MapExplorer from './pages/MapExplorer';
import DataCatalog from './pages/DataCatalog';
import CollectionRoutes from './pages/CollectionRoutes';
import SweepingRoutes from './pages/SweepingRoutes';
import UrbanFurniture from './pages/UrbanFurniture';
import DatabaseSchema from './pages/DatabaseSchema';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Route de connexion accessible publiquement */}
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées nécessitant une authentification */}
      <Route path="/" element={
        <ProtectedRoute isAllowed={isAuthenticated}>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Tableau de bord - page d'accueil */}
        <Route index element={<Dashboard />} />
        
        {/* Carte interactive */}
        <Route path="map" element={<MapExplorer />} />
        
        {/* Carte avec dataset spécifique */}
        <Route path="map/:id" element={<MapExplorer />} />
        
        {/* Catalogue de données */}
        <Route path="catalog" element={<DataCatalog />} />
        <Route path="data" element={<DataCatalog />} />
        
        {/* Gestion des circuits de collecte */}
        <Route path="collection" element={<CollectionRoutes />} />
        
        {/* Gestion des circuits de balayage */}
        <Route path="sweeping" element={<SweepingRoutes />} />
        
        {/* Gestion du mobilier urbain */}
        <Route path="furniture" element={<UrbanFurniture />} />
        
        {/* Structure de la base de données */}
        <Route path="database" element={<DatabaseSchema />} />
        
        {/* Paramètres (admin uniquement) */}
        <Route path="settings" element={<Settings />} />
        
        {/* Profil utilisateur */}
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Page 404 pour les routes non trouvées */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;