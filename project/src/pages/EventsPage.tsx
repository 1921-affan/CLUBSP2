import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase, Event, Club } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EventWithClub extends Event {
  club?: Club;
  isRegistered?: boolean;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (!eventsData) {
        setEvents([]);
        return;
      }

      const eventsWithClubs = await Promise.all(
        eventsData.map(async (event) => {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', event.organizer_club)
            .single();

          let isRegistered = false;
          if (user) {
            const { data: participantData } = await supabase
              .from('event_participants')
              .select('*')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isRegistered = !!participantData;
          }

          return {
            ...event,
            club: clubData,
            isRegistered,
          };
        })
      );

      setEvents(eventsWithClubs);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    setRegistering(eventId);
    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (event.isRegistered) {
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('event_participants').insert({
          event_id: eventId,
          user_id: user.id,
        });
      }

      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, isRegistered: !e.isRegistered } : e
        )
      );
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl text-green-100">Register for events and never miss out</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    {event.banner_url ? (
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="w-24 h-24 text-white" />
                    )}
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {event.title}
                        </h2>
                        {event.club && (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {event.club.name}
                          </span>
                        )}
                      </div>
                      {event.isRegistered && (
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registered
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{event.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={registering === event.id}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                          event.isRegistered
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {event.isRegistered ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>{registering === event.id ? 'Canceling...' : 'Cancel'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{registering === event.id ? 'Registering...' : 'Register'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No upcoming events</h3>
            <p className="text-gray-500">Check back later for new events</p>
          </div>
        )}
      </div>
    </div>
  );
}
