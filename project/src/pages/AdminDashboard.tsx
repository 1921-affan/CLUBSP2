import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { supabase, Club, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [pendingClubs, setPendingClubs] = useState<Club[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadPendingItems();
    }
  }, [profile]);

  const loadPendingItems = async () => {
    try {
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: true });

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: true });

      setPendingClubs(clubsData || []);
      setPendingEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClub = async (clubId: string) => {
    setProcessing(clubId);
    try {
      await supabase.from('clubs').update({ approved: true }).eq('id', clubId);
      setPendingClubs(pendingClubs.filter((club) => club.id !== clubId));
    } catch (error) {
      console.error('Error approving club:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClub = async (clubId: string) => {
    setProcessing(clubId);
    try {
      await supabase.from('clubs').delete().eq('id', clubId);
      setPendingClubs(pendingClubs.filter((club) => club.id !== clubId));
    } catch (error) {
      console.error('Error rejecting club:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    setProcessing(eventId);
    try {
      await supabase.from('events').update({ approved: true }).eq('id', eventId);
      setPendingEvents(pendingEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error('Error approving event:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    setProcessing(eventId);
    try {
      await supabase.from('events').delete().eq('id', eventId);
      setPendingEvents(pendingEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error('Error rejecting event:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-xl text-gray-600">Access denied</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl text-blue-100">Manage club and event approvals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingClubs.length}</p>
                <p className="text-gray-600">Pending Clubs</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingEvents.length}</p>
                <p className="text-gray-600">Pending Events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Clubs</h2>
            {pendingClubs.length > 0 ? (
              <div className="space-y-4">
                {pendingClubs.map((club) => (
                  <div key={club.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{club.name}</h3>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold mb-2">
                          {club.category}
                        </span>
                        <p className="text-gray-600 mb-2">{club.description}</p>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Faculty Advisor:</span> {club.faculty_advisor}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveClub(club.id)}
                          disabled={processing === club.id}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectClub(club.id)}
                          disabled={processing === club.id}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending clubs</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Events</h2>
            {pendingEvents.length > 0 ? (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={processing === event.id}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectEvent(event.id)}
                          disabled={processing === event.id}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
