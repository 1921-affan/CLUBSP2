import { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, Plus } from 'lucide-react';
import { supabase, Club, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string, clubId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { profile } = useAuth();
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: clubs } = await supabase
        .from('clubs')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(4);

      setFeaturedClubs(clubs || []);
      setUpcomingEvents(events || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Welcome to TheClubs</h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover clubs, attend events, and connect with your college community
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('clubs')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explore Clubs
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
            >
              View Events
            </button>
            {profile?.role === 'club_head' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Club</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{featuredClubs.length}+</p>
                <p className="text-gray-600">Active Clubs</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{upcomingEvents.length}+</p>
                <p className="text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">Growing</p>
                <p className="text-gray-600">Community</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Featured Clubs</h2>
            <button
              onClick={() => onNavigate('clubs')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredClubs.map((club) => (
              <div
                key={club.id}
                onClick={() => onNavigate('club-profile', club.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="w-20 h-20 object-cover rounded-full" />
                  ) : (
                    <Users className="w-16 h-16 text-white" />
                  )}
                </div>
                <div className="p-4">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded mb-2">
                    {club.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{club.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{club.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
            <button
              onClick={() => onNavigate('events')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-40 bg-gradient-to-r from-green-500 to-green-600"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {event.venue}
                    </span>
                    <button
                      onClick={() => onNavigate('events')}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      Register →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
