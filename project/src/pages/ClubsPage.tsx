import { useEffect, useState } from 'react';
import { Search, Users, Filter } from 'lucide-react';
import { supabase, Club } from '../lib/supabase';

interface ClubsPageProps {
  onNavigate: (page: string, clubId?: string) => void;
}

const categories = ['All', 'Cultural', 'Technical', 'Literary', 'Sports'];

export default function ClubsPage({ onNavigate }: ClubsPageProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm, selectedCategory]);

  const loadClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('approved', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((club) => club.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClubs(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Discover Clubs</h1>
          <p className="text-xl text-blue-100">Find the perfect club to match your interests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredClubs.length}</span> clubs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              onClick={() => onNavigate('club-profile', club.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-24 h-24 object-cover rounded-full border-4 border-white" />
                ) : (
                  <Users className="w-20 h-20 text-white" />
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {club.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{club.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description}</p>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">Faculty Advisor:</span> {club.faculty_advisor}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clubs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
