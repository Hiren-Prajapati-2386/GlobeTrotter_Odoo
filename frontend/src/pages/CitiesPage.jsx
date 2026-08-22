import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, MapPin, DollarSign, Award, Compass } from 'lucide-react';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/api/cities/');
        setCities(res.data);
      } catch (err) {
        console.error("Error fetching cities", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Compass className="w-8 h-8 text-brand animate-spin-slow" /> Discover Destinations
            </h1>
            <p className="text-sm text-slate-500 mt-1">Explore cities, daily average costs, and popularity ratings.</p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-brand transition">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm text-slate-500 text-sm font-medium">
            No matching destinations found. Try another query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <div
                key={city.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover-glow transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={city.image_url || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80'}
                    alt={city.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  <span className="absolute bottom-4 left-4 text-white text-lg font-extrabold flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-light" /> {city.name}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Country</span>
                    <span className="text-sm font-extrabold text-slate-700">{city.country}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-4 text-xs font-bold">
                    <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                      <DollarSign className="w-3.5 h-3.5" /> {parseFloat(city.cost_index).toFixed(2)}/day avg
                    </span>

                    <span className="text-amber-600 flex items-center gap-0.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100">
                      <Award className="w-3.5 h-3.5" /> Popularity: {city.popularity_score}
                    </span>
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

export default CitiesPage;
