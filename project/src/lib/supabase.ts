import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'club_head' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Club = {
  id: string;
  name: string;
  category: 'Cultural' | 'Technical' | 'Literary' | 'Sports';
  description: string;
  faculty_advisor: string;
  logo_url: string | null;
  whatsapp_link: string | null;
  created_by: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  organizer_club: string;
  banner_url: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  club_id: string;
  message: string;
  created_by: string | null;
  created_at: string;
};

export type ClubMember = {
  id: string;
  club_id: string;
  user_id: string;
  role_in_club: 'member' | 'head';
  joined_at: string;
};
