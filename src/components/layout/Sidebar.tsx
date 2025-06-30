import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  LayoutDashboard, 
  Map, 
  Database, 
  Truck, 
  Settings, 
  HelpCircle,
  Brush,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Carte interactive', href: '/map', icon: Map },
    { name: 'Catalogue de données', href: '/data', icon: Database },
    { name: 'Circuits de collecte', href: '/collection', icon: Truck, className: 'text-green-600' },
    { name: 'Circuits de balayage', href: '/sweeping', icon: Brush, className: 'text-green-600' },
    { name: 'Mobilier urbain', href: '/furniture', icon: Trash2, className: 'text-green-600' },
    ...(user?.role === 'admin' ? [{ name: 'Paramètres', href: '/settings', icon: Settings }] : []),
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-700">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo_siteWeb-3.png" alt="Geoportail Sonaged" className="h-8 w-auto" />
            </Link>
            <button
              className="p-1 rounded-md text-primary-300 hover:text-white focus:outline-none md:hidden"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.firstName || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {user?.firstName?.charAt(0) || user?.username.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-primary-300 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-primary-700 text-white'
                    : `text-primary-200 hover:bg-primary-700 hover:text-white ${item.className || ''}`
                }`}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary-700">
            <div className="space-y-1">
              <Link
                to="/help"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white"
              >
                <HelpCircle size={20} className="mr-3" />
                Aide
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;