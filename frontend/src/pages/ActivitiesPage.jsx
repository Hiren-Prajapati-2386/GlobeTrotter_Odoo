import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, Compass, DollarSign, Clock, MapPin, Tag, Plus, X, Calendar, Sparkles, FileText } from 'lucide-react';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [activityForm, setActivityForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    cost_override: '',
    notes: ''
  });
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actsRes = await api.get('/api/activities/');
        setActivities(actsRes.data);

        const citiesRes = await api.get('/api/cities/');
        setCities(citiesRes.data);

        const tripsRes = await api.get('/api/trips/');
        setTrips(tripsRes.data);
      } catch (err) {
        console.error("Error loading activities data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch stops when a trip is selected in the modal
  useEffect(() => {
    const fetchStopsForTrip = async () => {
      if (!selectedTripId) {
        setStops([]);
        setSelectedStopId('');
        return;
      }
      try {
        const res = await api.get(`/api/trips/${selectedTripId}/stops/`);
        // Filter stops that match the activity's city if we want,
        // or let them choose any stop (usually should match the activity city!)
        const matchingStops = res.data.filter(s => s.city_id === selectedActivity?.city_id);
        setStops(matchingStops);
        setSelectedStopId(matchingStops[0]?.id?.toString() || '');
        if (matchingStops[0]) {
          setActivityForm(prev => ({ ...prev, scheduled_date: matchingStops[0].start_date }));
        }
      } catch (err) {
        console.error("Failed to fetch stops for trip", err);
      }
    };
    fetchStopsForTrip();
  }, [selectedTripId, selectedActivity]);

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? `${city.name}, ${city.country}` : 'Unknown Location';
  };

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.name.toLowerCase().includes(search.toLowerCase()) || 
                          act.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || act.category === selectedCategory;
    const matchesCost = maxCost === '' || parseFloat(act.cost) <= parseFloat(maxCost);
    const matchesDuration = maxDuration === '' || (act.duration_minutes && act.duration_minutes <= parseInt(maxDuration));
    return matchesSearch && matchesCategory && matchesCost && matchesDuration;
  });

  const categories = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'History'];

  const openAddModal = (activity) => {
    setSelectedActivity(activity);
    setSelectedTripId(trips[0]?.id?.toString() || '');
    setSelectedStopId('');
    setModalError('');
    setSuccessMsg('');
    setActivityForm({
      scheduled_date: '',
      scheduled_time: '',
      cost_override: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSuccessMsg('');

    if (!selectedStopId) {
      setModalError('Please select a city stop on your trip.');
      return;
    }

    const targetStop = stops.find(s => s.id === parseInt(selectedStopId));
    if (targetStop) {
      const actDate = new Date(activityForm.scheduled_date);
      const stopStart = new Date(targetStop.start_date);
      const stopEnd = new Date(targetStop.end_date);

      if (actDate < stopStart || actDate > stopEnd) {
        setModalError(`Activity date must fall within stop dates: ${targetStop.start_date} to ${targetStop.end_date}`);
        return;
      }
    }

    try {
      await api.post(`/api/activities/stops/${selectedStopId}/activities`, {
        activity_id: selectedActivity.id,
        scheduled_date: activityForm.scheduled_date,
        scheduled_time: activityForm.scheduled_time || null,
        cost_override: activityForm.cost_override ? parseFloat(activityForm.cost_override) : null,
        notes: activityForm.notes || null
      });

      setSuccessMsg(`Successfully scheduled ${selectedActivity.name}!`);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to attach activity to stop.');
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
              <Compass className="w-8 h-8 text-brand animate-spin-slow" /> Explore Activities
            </h1>
            <p className="text-sm text-slate-500 mt-1">Browse things to do, sightseeing points, and food tours.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Cost Filter */}
            <input
              type="number"
              placeholder="Max Cost ($)"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand w-28"
            />

            {/* Duration Filter */}
            <input
              type="number"
              placeholder="Max Duration (min)"
              value={maxDuration}
              onChange={(e) => setMaxDuration(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand w-36"
            />

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl w-full sm:w-64 shadow-sm focus-within:ring-2 focus-within:ring-brand transition">
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

                  <div className="border-t border-slate-50 pt-4 space-y-3">
                    <div className="space-y-1 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" /> {getCityName(act.city_id)}
                      </span>
                      {act.duration_minutes && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" /> {act.duration_minutes} mins duration
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openAddModal(act)}
                      className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2 rounded-xl transition duration-200 flex justify-center items-center gap-1.5 custom-gradient-bg shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" /> Schedule Activity
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* SCHEDULE ACTIVITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Schedule: {selectedActivity?.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
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
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
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

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Trip Stop ({selectedActivity && getCityName(selectedActivity.city_id)})</label>
                {selectedTripId && stops.length === 0 ? (
                  <div className="text-xs text-rose-500 font-bold py-1.5 bg-rose-50 border border-rose-100 rounded-xl px-3 flex items-center gap-1.5">
                    No matching stop in {selectedActivity && getCityName(selectedActivity.city_id).split(',')[0]} scheduled on this trip.
                  </div>
                ) : (
                  <select
                    required
                    disabled={!selectedTripId || stops.length === 0}
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700 disabled:bg-slate-50"
                  >
                    <option value="">-- Choose Stop Date --</option>
                    {stops.map(s => (
                      <option key={s.id} value={s.id}>
                        Stop {s.order_index + 1}: {s.start_date} to {s.end_date}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    disabled={!selectedStopId}
                    value={activityForm.scheduled_date}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    disabled={!selectedStopId}
                    value={activityForm.scheduled_time}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Override Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Base: $${selectedActivity ? parseFloat(selectedActivity.cost).toFixed(2) : '0.00'}`}
                    disabled={!selectedStopId}
                    value={activityForm.cost_override}
                    onChange={(e) => setActivityForm({ ...activityForm, cost_override: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Meet at lobby"
                    disabled={!selectedStopId}
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700 disabled:bg-slate-50"
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
                  disabled={!selectedStopId}
                  className="px-5 py-2.5 bg-brand text-white font-bold rounded-xl text-sm custom-gradient-bg shadow-sm transition disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
