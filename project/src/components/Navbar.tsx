import { Users, LogOut, Home, Calendar, Megaphone, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">TheClubs</span>
            </div>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => onNavigate('clubs')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'clubs' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Clubs</span>
              </button>

              <button
                onClick={() => onNavigate('events')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'events' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </button>

              <button
                onClick={() => onNavigate('announcements')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'announcements' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Announcements</span>
              </button>

              {(profile?.role === 'admin' || profile?.role === 'club_head') && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{profile?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
