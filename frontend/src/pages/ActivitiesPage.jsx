import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, Compass, DollarSign, Clock, MapPin, Tag } from 'lucide-react';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actsRes = await api.get('/api/activities/');
        setActivities(actsRes.data);

        const citiesRes = await api.get('/api/cities/');
        setCities(citiesRes.data);
      } catch (err) {
        console.error("Error loading activities data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? `${city.name}, ${city.country}` : 'Unknown Location';
  };

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.name.toLowerCase().includes(search.toLowerCase()) || 
                          act.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'History'];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Compass className="w-8 h-8 text-brand animate-spin-slow" /> Explore Activities
            </h1>
            <p className="text-sm text-slate-500 mt-1">Browse things to do, sightseeing points, and food tours.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl w-full sm:w-64 md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-brand transition">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm text-slate-500 text-sm font-medium">
            No activities match your current search parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover-glow transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="bg-brand/10 border border-brand/20 text-brand text-xs font-bold px-2.5 py-1 rounded-xl">
                        {act.category}
                      </span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-0.5">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> {parseFloat(act.cost).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{act.name}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{act.description || 'Enjoy this local curated travel activity.'}</p>
                  </div>

                  <div className="border-t border-slate-50 pt-4 space-y-2 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" /> {getCityName(act.city_id)}
                    </span>
                    {act.duration_minutes && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> {act.duration_minutes} mins duration
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ActivitiesPage;
