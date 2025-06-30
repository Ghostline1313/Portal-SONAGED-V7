import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Key, Shield, LogOut, Save, X, Camera, Upload } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUserProfile, updateProfilePhoto } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Vous n'êtes pas connecté.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
    });
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        updateProfilePhoto(photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-6">Mon Profil</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Profile header */}
        <div className="bg-primary-700 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1.5">
                <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center overflow-hidden relative">
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.firstName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-medium text-primary-700">
                      {user.firstName?.charAt(0) || user.username.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
              >
                <Camera size={16} className="text-primary-600" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-20 pb-6 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">
                {user.email} • <span className="capitalize">{user.role}</span>
              </p>
            </div>
            <button
              className="mt-3 sm:mt-0 btn-outline text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={logout}
            >
              <LogOut size={16} className="mr-1.5" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Success message */}
        {saveSuccess && (
          <div className="mx-8 mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Vos modifications ont été enregistrées avec succès.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} className="inline mr-1.5" />
              Informations personnelles
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <Key size={16} className="inline mr-1.5" />
              Sécurité
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} className="inline mr-1.5" />
              Notifications
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'permissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('permissions')}
            >
              <Shield size={16} className="inline mr-1.5" />
              Permissions
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Modifier
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <X size={16} className="mr-1.5" />
                        Annuler
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                      >
                        <Save size={16} className="mr-1.5" />
                        Sauvegarder
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        defaultValue={user.role}
                        disabled
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="geomatician">Géomaticien</option>
                        <option value="viewer">Lecteur</option>
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Contactez un administrateur pour modifier votre rôle</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le mot de passe</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Assurez-vous d'utiliser un mot de passe sécurisé que vous n'utilisez pas ailleurs.
                </p>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                      Mot de passe actuel
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="current-password"
                        id="current-password"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      Nouveau mot de passe
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="new-password"
                        id="new-password"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de notification</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifications-email"
                      name="notifications-email"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications-email" className="font-medium text-gray-700">
                      Notifications par email
                    </label>
                    <p className="text-gray-500">Recevoir des emails pour les alertes importantes et les mises à jour.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifications-browser"
                      name="notifications-browser"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications-browser" className="font-medium text-gray-700">
                      Notifications dans le navigateur
                    </label>
                    <p className="text-gray-500">Recevoir des notifications en temps réel dans l'application.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-700">Types de notifications</h4>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifications-alerts"
                      name="notifications-alerts"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications-alerts" className="font-medium text-gray-700">
                      Alertes système
                    </label>
                    <p className="text-gray-500">Erreurs, avertissements et notifications critiques.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifications-updates"
                      name="notifications-updates"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications-updates" className="font-medium text-gray-700">
                      Mises à jour de données
                    </label>
                    <p className="text-gray-500">Nouvelles données ou modifications importantes.</p>
                  </div>
                </div>
              </div>
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sauvegarder les préférences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Autorisations et accès</h3>
              <p className="text-sm text-gray-500 mb-6">
                Votre compte possède les autorisations suivantes en fonction de votre rôle.
              </p>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <div className="flex items-center">
                  <Shield size={20} className="text-primary-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Rôle actuel: <span className="capitalize">{user.role}</span></h4>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-7">
                  {user.role === 'admin' && "Accès complet à toutes les fonctionnalités et données du système."}
                  {user.role === 'geomatician' && "Accès à la création et modification des données géospatiales."}
                  {user.role === 'viewer' && "Accès en lecture seule aux données et visualisations."}
                </p>
              </div>

              <h4 className="font-medium text-gray-900 mb-3">Détail des permissions</h4>
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ressource
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lire
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modifier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supprimer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Données cartographiques
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-green-600">✓</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role !== 'viewer' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role !== 'viewer' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Utilisateurs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rapports
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-green-600">✓</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role !== 'viewer' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role !== 'viewer' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;