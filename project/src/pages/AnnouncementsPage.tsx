import { useEffect, useState } from 'react';
import { Megaphone, Users, Clock } from 'lucide-react';
import { supabase, Announcement, Club, Profile } from '../lib/supabase';

interface AnnouncementWithDetails extends Announcement {
  club?: Club;
  author?: Profile;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!announcementsData) {
        setAnnouncements([]);
        return;
      }

      const announcementsWithDetails = await Promise.all(
        announcementsData.map(async (announcement) => {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', announcement.club_id)
            .single();

          let authorData = null;
          if (announcement.created_by) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', announcement.created_by)
              .single();
            authorData = data;
          }

          return {
            ...announcement,
            club: clubData,
            author: authorData,
          };
        })
      );

      setAnnouncements(announcementsWithDetails);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Announcements</h1>
          <p className="text-xl text-orange-100">Stay updated with the latest from your clubs</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {announcement.club?.name || 'Unknown Club'}
                        </h3>
                        {announcement.author && (
                          <p className="text-sm text-gray-500">Posted by {announcement.author.name}</p>
                        )}
                      </div>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {getTimeAgo(announcement.created_at)}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No announcements yet</h3>
            <p className="text-gray-500">Check back later for updates from clubs</p>
          </div>
        )}
      </div>
    </div>
  );
}
