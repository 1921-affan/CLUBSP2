import { useEffect, useState } from 'react';
import { Plus, Calendar, Megaphone, Users, Save } from 'lucide-react';
import { supabase, Club, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type DashboardView = 'overview' | 'create-club' | 'create-event' | 'create-announcement';

export default function ClubDashboard() {
  const { profile, user } = useAuth();
  const [view, setView] = useState<DashboardView>('overview');
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clubForm, setClubForm] = useState({
    name: '',
    category: 'Technical' as 'Cultural' | 'Technical' | 'Literary' | 'Sports',
    description: '',
    faculty_advisor: '',
    whatsapp_link: '',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    organizer_club: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    club_id: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: memberData } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user!.id)
        .eq('role_in_club', 'head');

      const clubIds = memberData?.map((m) => m.club_id) || [];

      if (clubIds.length > 0) {
        const { data: clubsData } = await supabase
          .from('clubs')
          .select('*')
          .in('id', clubIds);

        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .in('organizer_club', clubIds)
          .order('date', { ascending: false });

        setMyClubs(clubsData || []);
        setMyEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: newClub, error } = await supabase
        .from('clubs')
        .insert({
          ...clubForm,
          created_by: user!.id,
          approved: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (newClub) {
        await supabase.from('club_members').insert({
          club_id: newClub.id,
          user_id: user!.id,
          role_in_club: 'head',
        });
      }

      setClubForm({
        name: '',
        category: 'Technical',
        description: '',
        faculty_advisor: '',
        whatsapp_link: '',
      });
      setView('overview');
      loadDashboardData();
    } catch (error) {
      console.error('Error creating club:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase.from('events').insert({
        ...eventForm,
        approved: false,
      });

      setEventForm({
        title: '',
        description: '',
        date: '',
        venue: '',
        organizer_club: '',
      });
      setView('overview');
      loadDashboardData();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase.from('announcements').insert({
        ...announcementForm,
        created_by: user!.id,
      });

      setAnnouncementForm({
        club_id: '',
        message: '',
      });
      setView('overview');
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-4xl font-bold mb-4">Club Dashboard</h1>
          <p className="text-xl text-blue-100">Manage your clubs, events, and announcements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setView('overview')}
            className={`p-4 rounded-lg font-semibold transition-colors ${
              view === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('create-club')}
            className={`p-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
              view === 'create-club' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Create Club</span>
          </button>
          <button
            onClick={() => setView('create-event')}
            className={`p-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
              view === 'create-event' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            disabled={myClubs.length === 0}
          >
            <Calendar className="w-5 h-5" />
            <span>Create Event</span>
          </button>
          <button
            onClick={() => setView('create-announcement')}
            className={`p-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
              view === 'create-announcement' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            disabled={myClubs.length === 0}
          >
            <Megaphone className="w-5 h-5" />
            <span>Post</span>
          </button>
        </div>

        {view === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Clubs</h2>
              {myClubs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {myClubs.map((club) => (
                    <div key={club.id} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{club.name}</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                          club.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {club.approved ? 'Approved' : 'Pending'}
                      </span>
                      <p className="text-gray-600 text-sm">{club.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500 mb-4">You don't manage any clubs yet</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Events</h2>
              {myEvents.length > 0 ? (
                <div className="space-y-4">
                  {myEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No events created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'create-club' && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Club</h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                <input
                  type="text"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={clubForm.category}
                  onChange={(e) => setClubForm({ ...clubForm, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Technical">Technical</option>
                  <option value="Literary">Literary</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Club'}
              </button>
            </form>
          </div>
        )}

        {view === 'create-event' && myClubs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizing Club</label>
                <select
                  value={eventForm.organizer_club}
                  onChange={(e) => setEventForm({ ...eventForm, organizer_club: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select a club</option>
                  {myClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                {saving ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

        {view === 'create-announcement' && myClubs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Post Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                <select
                  value={announcementForm.club_id}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, club_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select a club</option>
                  {myClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
              >
                {saving ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
