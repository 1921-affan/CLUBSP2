import { useEffect, useState } from 'react';
import { Users, MapPin, Calendar, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { supabase, Club, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ClubProfilePageProps {
  clubId: string;
  onNavigate: (page: string) => void;
}

export default function ClubProfilePage({ clubId, onNavigate }: ClubProfilePageProps) {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadClubData();
  }, [clubId, user]);

  const loadClubData = async () => {
    try {
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_club', clubId)
        .eq('approved', true)
        .order('date', { ascending: true });

      const { count } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (user) {
        const { data: memberData } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsMember(!!memberData);
      }

      setClub(clubData);
      setEvents(eventsData || []);
      setMemberCount(count || 0);
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user || !club) return;

    setJoining(true);
    try {
      if (isMember) {
        await supabase
          .from('club_members')
          .delete()
          .eq('club_id', club.id)
          .eq('user_id', user.id);
        setIsMember(false);
        setMemberCount(memberCount - 1);
      } else {
        await supabase.from('club_members').insert({
          club_id: club.id,
          user_id: user.id,
          role_in_club: 'member',
        });
        setIsMember(true);
        setMemberCount(memberCount + 1);
      }
    } catch (error) {
      console.error('Error joining/leaving club:', error);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading club...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-xl text-gray-600">Club not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-64 bg-gradient-to-r from-blue-500 to-blue-700 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex items-end space-x-6 relative z-10">
            <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Users className="w-16 h-16 text-blue-600" />
              )}
            </div>
            <div className="text-white pb-2">
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {club.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{club.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.venue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming events</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleJoinLeave}
                disabled={joining}
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  isMember
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isMember ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{joining ? 'Processing...' : isMember ? 'Leave Club' : 'Join Club'}</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-blue-600" />
                  <span>{memberCount} members</span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Faculty Advisor</p>
                  <p className="text-gray-800 font-semibold">{club.faculty_advisor}</p>
                </div>
              </div>
            </div>

            {club.whatsapp_link && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <a
                  href={club.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact via WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
