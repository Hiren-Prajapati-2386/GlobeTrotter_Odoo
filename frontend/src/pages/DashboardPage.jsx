import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Calendar, MapPin, Trash2, ArrowRight, Compass, Sparkles, X, Globe, Eye, DollarSign, Edit3 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [recommendedCities, setRecommendedCities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  
  // Create trip form state
  const [tripForm, setTripForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_photo_url: '',
    is_public: false
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch user's trips
      const tripsRes = await api.get('/api/trips/');
      setTrips(tripsRes.data);

      // Fetch popular cities for recommendations
      const citiesRes = await api.get('/api/cities/');
      setRecommendedCities(citiesRes.data.slice(0, 3)); // show top 3 popular
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick validation
    if (new Date(tripForm.start_date) > new Date(tripForm.end_date)) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      // Default placeholder travel image if none provided
      const finalForm = {
        ...tripForm,
        cover_photo_url: tripForm.cover_photo_url.trim() || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
      };

      if (isEditMode) {
        await api.put(`/api/trips/${selectedTripId}`, finalForm);
      } else {
        await api.post('/api/trips/', finalForm);
      }
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedTripId(null);
      setTripForm({ name: '', description: '', start_date: '', end_date: '', cover_photo_url: '', is_public: false });
      fetchDashboardData(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save trip. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setError('');
    try {
      const res = await api.post('/api/trips/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTripForm(prev => ({ ...prev, cover_photo_url: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload cover image.');
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedTripId(null);
    setTripForm({ name: '', description: '', start_date: '', end_date: '', cover_photo_url: '', is_public: false });
    setIsModalOpen(true);
  };

  const openEditModal = (trip, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditMode(true);
    setSelectedTripId(trip.id);
    setTripForm({
      name: trip.name,
      description: trip.description || '',
      start_date: trip.start_date,
      end_date: trip.end_date,
      cover_photo_url: trip.cover_photo_url || '',
      is_public: trip.is_public
    });
    setIsModalOpen(true);
  };

  const handleDeleteTrip = async (tripId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip and all its stops?')) return;

    try {
      await api.delete(`/api/trips/${tripId}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  // Determine trip status (Upcoming, Ongoing, Completed)
  const getTripStatus = (start, end) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (today < startDate) {
      return { text: 'Upcoming', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    } else if (today >= startDate && today <= endDate) {
      return { text: 'Ongoing', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else {
      return { text: 'Completed', style: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // Pre-fill some gorgeous unsplash cover presets
  const coverPresets = [
    { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mountain Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Historical City', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80' },
    { name: 'Nature Retreat', url: 'https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 animate-fadeIn">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Welcome Section */}
        <div className="custom-gradient-bg text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-bold w-fit uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Ready for adventure
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Where to, {user?.name || 'Explorer'}?
            </h1>
            <p className="text-sky-100 text-base md:text-lg max-w-xl">
              Create your customized multi-city itinerary, manage your daily budget, and share your public trips.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="relative z-10 bg-white hover:bg-slate-50 text-brand font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Plan New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Globe className="w-6 h-6 text-brand" />
              Your Travel Plans
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-6 h-40 animate-pulse border border-slate-100"></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No trips planned yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Your upcoming adventures will appear here. Start by planning your first multi-city trip.
                </p>
                <button
                  onClick={openCreateModal}
                  className="bg-brand text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  Create First Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trips.map((trip) => {
                  const status = getTripStatus(trip.start_date, trip.end_date);
                  return (
                    <div
                      key={trip.id}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover-glow transition-all duration-300 relative flex flex-col h-full animate-slideUp"
                    >
                      {/* Cover Photo */}
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={trip.cover_photo_url}
                          alt={trip.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        
                        {/* Status Badge */}
                        <span className={`absolute top-4 left-4 text-xs font-bold border px-3 py-1 rounded-full backdrop-blur-md ${status.style}`}>
                          {status.text}
                        </span>

                        {trip.is_public && (
                          <span className="absolute top-4 right-4 bg-sky-50 text-sky-700 border border-sky-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Shared
                          </span>
                        )}
                      </div>

                      {/* Info Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-brand transition mb-2">
                            {trip.name}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                            {trip.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600 border-t border-slate-50 pt-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>
                                {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {' - '}
                                {new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{trip.stops?.length || 0} stops planned</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                            <Link
                              to={`/trip/${trip.id}`}
                              className="flex items-center gap-1.5 text-sm font-bold text-brand hover:gap-2.5 transition-all duration-200"
                            >
                              Open Trip <ArrowRight className="w-4 h-4" />
                            </Link>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => openEditModal(trip, e)}
                                className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-slate-50 transition"
                                title="Edit Trip"
                              >
                                <Edit3 className="w-4.5 h-4.5" />
                              </button>
                              
                              <button
                                onClick={(e) => handleDeleteTrip(trip.id, e)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete Trip"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Popular Destinations
            </h2>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100"></div>
                ))
              ) : (
                recommendedCities.map((city) => (
                  <div
                    key={city.id}
                    className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                      <img
                        src={city.image_url || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80'}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1">
                      <div>
                        <h3 className="font-bold text-slate-800 leading-tight">{city.name}</h3>
                        <span className="text-xs text-slate-400 font-semibold">{city.country}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          {city.cost_index}/day
                        </span>
                        <Link
                          to="/cities"
                          className="font-bold text-brand hover:underline"
                        >
                          Explore
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* CREATE TRIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-2xl font-extrabold text-slate-800">
                {isEditMode ? 'Edit Trip Details' : 'Plan a New Adventure'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTrip} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Trip Name</label>
                <input
                  type="text"
                  required
                  value={tripForm.name}
                  onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                  placeholder="e.g. European Explorer Tour"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  value={tripForm.description}
                  onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                  placeholder="Summarize your travel goals or ideas..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={tripForm.start_date}
                    onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={tripForm.end_date}
                    onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cover Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={tripForm.cover_photo_url}
                    onChange={(e) => setTripForm({ ...tripForm, cover_photo_url: e.target.value })}
                    placeholder="Paste an Unsplash or online image link"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition mb-2"
                  />
                  
                  {/* presets */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {coverPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setTripForm({ ...tripForm, cover_photo_url: preset.url })}
                        className="text-xs font-semibold px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-2xl">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-2">Or Upload Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={tripForm.is_public}
                  onChange={(e) => setTripForm({ ...tripForm, is_public: e.target.checked })}
                  className="w-4.5 h-4.5 text-brand focus:ring-brand border-slate-300 rounded"
                />
                <label htmlFor="is_public" className="text-sm font-bold text-slate-700 select-none">
                  Make this trip public (sharable link)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50 -mx-8 -mb-8 px-8 py-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold custom-gradient-bg shadow-md hover:shadow-lg transition"
                >
                  {isEditMode ? 'Save Changes' : 'Plan Trip'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
