import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>

          <div className="ml-4 md:ml-0 flex items-center">
            <span className="font-bold text-xl text-primary-700">Geoportail Sonaged</span>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-8 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Rechercher..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
            <Bell size={20} />
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user?.firstName || user?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={18} className="text-primary-700" />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.firstName || user?.username}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Mon Profil
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;