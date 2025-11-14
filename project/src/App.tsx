import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ClubsPage from './pages/ClubsPage';
import ClubProfilePage from './pages/ClubProfilePage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminDashboard from './pages/AdminDashboard';
import ClubDashboard from './pages/ClubDashboard';
import Navbar from './components/Navbar';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigate = (page: string, clubId?: string) => {
    setCurrentPage(page);
    if (clubId) {
      setSelectedClubId(clubId);
    }
  };

  return (
    <div>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'clubs' && <ClubsPage onNavigate={handleNavigate} />}
        {currentPage === 'club-profile' && selectedClubId && (
          <ClubProfilePage clubId={selectedClubId} onNavigate={handleNavigate} />
        )}
        {currentPage === 'events' && <EventsPage />}
        {currentPage === 'announcements' && <AnnouncementsPage />}
        {currentPage === 'dashboard' && <ClubDashboard />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
