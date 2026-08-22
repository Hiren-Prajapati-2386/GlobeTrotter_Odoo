import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, MapPin, DollarSign, Award, Compass, Plus, X, Calendar, Sparkles } from 'lucide-react';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopForm, setStopForm] = useState({
    trip_id: '',
    start_date: '',
    end_date: ''
  });
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const citiesRes = await api.get('/api/cities/');
        setCities(citiesRes.data);

        // Fetch user's trips for the dropdown selection
        const tripsRes = await api.get('/api/trips/');
        setTrips(tripsRes.data);
      } catch (err) {
        console.error("Error fetching cities/trips", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived filter options
  const countries = [...new Set(cities.map(c => c.country))].sort();
  const regions = [...new Set(cities.map(c => c.region).filter(Boolean))].sort();

  const filteredCities = cities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.country.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = selectedCountry === '' || c.country === selectedCountry;
    const matchesRegion = selectedRegion === '' || c.region === selectedRegion;
    return matchesSearch && matchesCountry && matchesRegion;
  });

  const openAddModal = (city) => {
    setSelectedCity(city);
    setModalError('');
    setSuccessMsg('');
    setStopForm({
      trip_id: trips[0]?.id?.toString() || '',
      start_date: '',
      end_date: ''
    });
    setIsModalOpen(true);
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSuccessMsg('');

    if (!stopForm.trip_id) {
      setModalError('Please select a trip first.');
      return;
    }

    if (new Date(stopForm.start_date) > new Date(stopForm.end_date)) {
      setModalError('Start date cannot be after end date.');
      return;
    }

    const targetTrip = trips.find(t => t.id === parseInt(stopForm.trip_id));
    if (targetTrip) {
      const stopStart = new Date(stopForm.start_date);
      const stopEnd = new Date(stopForm.end_date);
      const tripStart = new Date(targetTrip.start_date);
      const tripEnd = new Date(targetTrip.end_date);

      if (stopStart < tripStart || stopEnd > tripEnd) {
        setModalError(`Stop dates must be within trip dates: ${targetTrip.start_date} to ${targetTrip.end_date}`);
        return;
      }
    }

    try {
      // Get current stops count for order_index
      const stopsRes = await api.get(`/api/trips/${stopForm.trip_id}/stops/`);
      const order_index = stopsRes.data.length;

      await api.post(`/api/trips/${stopForm.trip_id}/stops/`, {
        city_id: selectedCity.id,
        start_date: stopForm.start_date,
        end_date: stopForm.end_date,
        order_index
      });

      setSuccessMsg(`Successfully added ${selectedCity.name} to "${targetTrip.name}"!`);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to add stop to trip.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Header Title */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Compass className="w-8 h-8 text-brand animate-spin-slow" /> Discover Destinations
            </h1>
            <p className="text-sm text-slate-500 mt-1">Explore cities, daily average costs, and popularity ratings.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            
            {/* Country filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Region filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl w-full sm:w-64 shadow-sm focus-within:ring-2 focus-within:ring-brand transition">
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
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm text-slate-500 text-sm font-medium">
            No matching destinations found. Try another query or adjust filters.
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

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Country / Region</span>
                      <span className="text-sm font-extrabold text-slate-700">{city.country}{city.region ? ` (${city.region})` : ''}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-4 text-xs font-bold">
                    <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                      <DollarSign className="w-3.5 h-3.5" /> {parseFloat(city.cost_index).toFixed(2)}/day avg
                    </span>

                    <span className="text-amber-600 flex items-center gap-0.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100">
                      <Award className="w-3.5 h-3.5" /> Popularity: {city.popularity_score}
                    </span>
                  </div>

                  <button
                    onClick={() => openAddModal(city)}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-xl transition duration-200 flex justify-center items-center gap-2 custom-gradient-bg shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add to Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ADD CITY TO TRIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" /> Add Stop: {selectedCity?.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                  {modalError}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Trip</label>
                {trips.length === 0 ? (
                  <div className="text-xs text-slate-500 font-medium py-1.5">
                    No active trips found. Please plan a trip first.
                  </div>
                ) : (
                  <select
                    required
                    value={stopForm.trip_id}
                    onChange={(e) => setStopForm({ ...stopForm, trip_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
                  >
                    <option value="">-- Choose Trip --</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.start_date} to {t.end_date})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={stopForm.start_date}
                    onChange={(e) => setStopForm({ ...stopForm, start_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={stopForm.end_date}
                    onChange={(e) => setStopForm({ ...stopForm, end_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={trips.length === 0}
                  className="px-5 py-2.5 bg-brand text-white font-bold rounded-xl text-sm custom-gradient-bg shadow-sm transition disabled:opacity-50"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesPage;
