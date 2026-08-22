import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Calendar, MapPin, Trash2, ArrowUp, ArrowDown, Sparkles, Compass, Edit3, DollarSign, Clock, Share2, Clipboard, ChevronRight, BarChart2, Check, X, AlertCircle } from 'lucide-react';

const ItineraryBuilderPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals / forms states
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activeStop, setActiveStop] = useState(null);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Edit Scheduled Activity Modal state
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [activeTripActivity, setActiveTripActivity] = useState(null);

  // Forms state
  const [stopForm, setStopForm] = useState({
    city_id: '',
    start_date: '',
    end_date: '',
  });

  const [activityForm, setActivityForm] = useState({
    activity_id: '',
    scheduled_date: '',
    scheduled_time: '',
    cost_override: '',
    notes: '',
  });

  const [copiedLink, setCopiedLink] = useState(false);

  const fetchTripDetails = async () => {
    try {
      const tripRes = await api.get(`/api/trips/${id}`);
      setTrip(tripRes.data);

      const stopsRes = await api.get(`/api/trips/${id}/stops/`);
      const orderedStops = stopsRes.data.sort((a, b) => a.order_index - b.order_index);
      setStops(orderedStops);

      const citiesRes = await api.get('/api/cities/');
      setCities(citiesRes.data);
    } catch (err) {
      console.error("Error fetching trip details", err);
      setError("Failed to load trip details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleAddStop = async (e) => {
    e.preventDefault();
    setError('');

    // Date validations
    if (new Date(stopForm.start_date) > new Date(stopForm.end_date)) {
      setError('Stop start date cannot be after end date.');
      return;
    }

    if (new Date(stopForm.start_date) < new Date(trip.start_date) || new Date(stopForm.end_date) > new Date(trip.end_date)) {
      setError(`Stop dates must be within trip dates: ${trip.start_date} to ${trip.end_date}`);
      return;
    }

    try {
      const order_index = stops.length;
      await api.post(`/api/trips/${id}/stops/`, {
        ...stopForm,
        city_id: parseInt(stopForm.city_id),
        order_index
      });
      setIsStopModalOpen(false);
      setStopForm({ city_id: '', start_date: '', end_date: '' });
      fetchTripDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add stop.');
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this stop and all its scheduled activities?')) return;
    try {
      await api.delete(`/api/trips/${id}/stops/${stopId}`);
      fetchTripDetails();
    } catch (err) {
      alert('Failed to remove stop.');
    }
  };

  const handleMoveStop = async (index, direction) => {
    const newStops = [...stops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    // Swap elements locally
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    // Build ordered list of IDs
    const stopIds = newStops.map(s => s.id);
    
    try {
      setStops(newStops); // Optimistic UI update
      await api.put(`/api/trips/${id}/stops/reorder`, stopIds);
      fetchTripDetails();
    } catch (err) {
      alert('Failed to reorder stops.');
      fetchTripDetails(); // Revert on failure
    }
  };

  const openAddActivity = async (stop) => {
    setActiveStop(stop);
    setActivityForm({
      activity_id: '',
      scheduled_date: stop.start_date, // Default to stop start date
      scheduled_time: '',
      cost_override: '',
      notes: '',
    });

    try {
      // Fetch available activities for this city
      const actsRes = await api.get(`/api/activities/?city_id=${stop.city_id}`);
      setAvailableActivities(actsRes.data);
      setIsActivityModalOpen(true);
    } catch (err) {
      alert('Failed to load activities for this city.');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setError('');

    // Validation: activity date must fall within stop start/end dates
    const actDate = new Date(activityForm.scheduled_date);
    const stopStart = new Date(activeStop.start_date);
    const stopEnd = new Date(activeStop.end_date);

    if (actDate < stopStart || actDate > stopEnd) {
      setError(`Activity date must be during this stop: ${activeStop.start_date} to ${activeStop.end_date}`);
      return;
    }

    try {
      await api.post(`/api/activities/stops/${activeStop.id}/activities`, {
        activity_id: parseInt(activityForm.activity_id),
        scheduled_date: activityForm.scheduled_date,
        scheduled_time: activityForm.scheduled_time || null,
        cost_override: activityForm.cost_override ? parseFloat(activityForm.cost_override) : null,
        notes: activityForm.notes || null
      });
      setIsActivityModalOpen(false);
      fetchTripDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to attach activity.');
    }
  };

  const openEditActivity = (tripAct, stop) => {
    setActiveStop(stop);
    setActiveTripActivity(tripAct);
    setActivityForm({
      activity_id: tripAct.activity_id,
      scheduled_date: tripAct.scheduled_date,
      scheduled_time: tripAct.scheduled_time || '',
      cost_override: tripAct.cost_override || '',
      notes: tripAct.notes || '',
    });
    setIsEditActivityModalOpen(true);
  };

  const handleEditActivity = async (e) => {
    e.preventDefault();
    setError('');

    const actDate = new Date(activityForm.scheduled_date);
    const stopStart = new Date(activeStop.start_date);
    const stopEnd = new Date(activeStop.end_date);

    if (actDate < stopStart || actDate > stopEnd) {
      setError(`Activity date must be during this stop: ${activeStop.start_date} to ${activeStop.end_date}`);
      return;
    }

    try {
      await api.put(`/api/activities/trip-activities/${activeTripActivity.id}`, {
        scheduled_date: activityForm.scheduled_date,
        scheduled_time: activityForm.scheduled_time || null,
        cost_override: activityForm.cost_override ? parseFloat(activityForm.cost_override) : null,
        notes: activityForm.notes || null
      });
      setIsEditActivityModalOpen(false);
      fetchTripDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update activity.');
    }
  };

  const handleDeleteActivity = async (tripActId) => {
    if (!window.confirm('Remove this activity from your stop?')) return;
    try {
      await api.delete(`/api/activities/trip-activities/${tripActId}`);
      fetchTripDetails();
    } catch (err) {
      alert('Failed to remove activity.');
    }
  };

  const handleToggleShare = async () => {
    try {
      const updatedPublic = !shareStatus.is_public;
      await api.put(`/api/trips/${id}`, {
        name: trip.name,
        description: trip.description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        cover_photo_url: trip.cover_photo_url,
        is_public: updatedPublic
      });
      
      setShareStatus({
        ...shareStatus,
        is_public: updatedPublic
      });
      fetchTripDetails();
    } catch (err) {
      alert('Failed to change share status.');
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/shared/${trip?.share_token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-bold">
          Loading Trip Details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Back Link */}
        <Link to="/dashboard" className="text-slate-500 hover:text-brand font-bold text-sm flex items-center gap-1 mb-6 transition">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>

        {/* Trip Header Banner */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              {trip?.name}
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">{trip?.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip?.start_date} to {trip?.end_date}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {stops.length} Stops
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              to={`/trip/${id}/budget`}
              className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <BarChart2 className="w-4 h-4 text-emerald-500" /> Budget breakdown
            </Link>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-brand text-white font-bold px-4 py-2.5 rounded-xl text-sm custom-gradient-bg shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Share Trip
            </button>
          </div>
        </div>

        {/* Builder Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Stops Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <Compass className="w-6 h-6 text-brand" /> Stops & Timeline
              </h2>
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="bg-brand/10 hover:bg-brand/20 text-brand font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add City Stop
              </button>
            </div>

            {stops.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm space-y-4">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No stops scheduled</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">
                  Add stops (destinations) to build your multi-city travel timeline.
                </p>
                <button
                  onClick={() => setIsStopModalOpen(true)}
                  className="bg-brand text-white font-bold px-4 py-2 rounded-xl text-sm shadow transition"
                >
                  Add Your First Stop
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8 pt-4">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="relative group/stop">
                    
                    {/* Timeline Node Badge */}
                    <div className="absolute -left-[37px] top-0.5 bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow custom-gradient-bg">
                      {index + 1}
                    </div>

                    {/* Stop Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
                      
                      {/* Stop Info Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          {stop.city?.image_url && (
                            <img
                              src={stop.city.image_url}
                              alt={stop.city.name}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-100"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                              {stop.city?.name}
                              <span className="text-xs font-semibold text-slate-400">({stop.city?.country})</span>
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {stop.start_date} to {stop.end_date}
                            </span>
                          </div>
                        </div>

                        {/* Stop Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStop(index, -1)}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Stop Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStop(index, 1)}
                            disabled={index === stops.length - 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Stop Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Activities for Stop */}
                      <div className="space-y-3 pt-3 border-t border-slate-50">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Activities</h4>
                          <button
                            onClick={() => openAddActivity(stop)}
                            className="text-xs font-bold text-brand hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Schedule Activity
                          </button>
                        </div>

                        {stop.trip_activities?.length === 0 ? (
                          <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
                            No activities scheduled for this stop.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {stop.trip_activities?.map((tripAct) => (
                              <div
                                key={tripAct.id}
                                className="flex justify-between items-center gap-4 bg-slate-50/70 border border-slate-100 hover:border-slate-200 px-4 py-3 rounded-xl transition duration-150"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-brand-light text-brand p-2 rounded-lg text-xs font-bold">
                                    {tripAct.activity?.category || 'General'}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 leading-tight">
                                      {tripAct.activity?.name}
                                    </span>
                                    
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mt-1">
                                      <span className="flex items-center gap-0.5">
                                        <Calendar className="w-3 h-3" /> {tripAct.scheduled_date}
                                      </span>
                                      {tripAct.scheduled_time && (
                                        <span className="flex items-center gap-0.5">
                                          <Clock className="w-3 h-3" /> {tripAct.scheduled_time}
                                        </span>
                                      )}
                                      <span className="text-slate-700 font-bold flex items-center gap-0.5">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        {tripAct.cost_override !== null ? tripAct.cost_override : tripAct.activity?.cost}
                                      </span>
                                    </div>
                                    
                                    {tripAct.notes && (
                                      <p className="text-xs text-slate-500 italic mt-1 font-medium bg-white/50 px-2 py-0.5 rounded border border-slate-100/50 w-fit">
                                        Note: {tripAct.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditActivity(tripAct, stop)}
                                    className="p-1 rounded text-slate-400 hover:text-brand hover:bg-white"
                                    title="Edit Scheduled Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteActivity(tripAct.id)}
                                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-white"
                                    title="Detach Activity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" /> Details & Guides
            </h2>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-2">Plan Details</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Add stops, reorder destinations using arrows, and assign activities to organize dates. Keep tabs on costs using the budget page.
              </p>
              <div className="space-y-2">
                <Link
                  to={`/trip/${id}/budget`}
                  className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl text-emerald-800 font-bold transition text-sm shadow-sm"
                >
                  <span className="flex items-center gap-1.5"><DollarSign className="w-4.5 h-4.5" /> Manage Budget</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ADD STOP MODAL */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">Add City Stop</h3>
              <button onClick={() => setIsStopModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStop} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select City</label>
                <select
                  required
                  value={stopForm.city_id}
                  onChange={(e) => setStopForm({ ...stopForm, city_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                >
                  <option value="">-- Choose City --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={stopForm.start_date}
                  onChange={(e) => setStopForm({ ...stopForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={stopForm.end_date}
                  onChange={(e) => setStopForm({ ...stopForm, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white font-bold rounded-xl text-sm custom-gradient-bg shadow-sm transition"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE ACTIVITY MODAL */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">Schedule Activity at {activeStop?.city?.name}</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Activity</label>
                <select
                  required
                  value={activityForm.activity_id}
                  onChange={(e) => setActivityForm({ ...activityForm, activity_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                >
                  <option value="">-- Choose Activity --</option>
                  {availableActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name} (${act.cost})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={activityForm.scheduled_date}
                  onChange={(e) => setActivityForm({ ...activityForm, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Time (Optional)</label>
                  <input
                    type="time"
                    value={activityForm.scheduled_time}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Override Cost (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Base cost if blank"
                    value={activityForm.cost_override}
                    onChange={(e) => setActivityForm({ ...activityForm, cost_override: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Booking code, meet at entrance..."
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white font-bold rounded-xl text-sm custom-gradient-bg shadow-sm transition"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHEDULED ACTIVITY MODAL */}
      {isEditActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">Edit Scheduled Details</h3>
              <button onClick={() => setIsEditActivityModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditActivity} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={activityForm.scheduled_date}
                  onChange={(e) => setActivityForm({ ...activityForm, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Scheduled Time (Optional)</label>
                  <input
                    type="time"
                    value={activityForm.scheduled_time}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Override Cost (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Base cost if blank"
                    value={activityForm.cost_override}
                    onChange={(e) => setActivityForm({ ...activityForm, cost_override: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Booking code, meet at entrance..."
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditActivityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white font-bold rounded-xl text-sm custom-gradient-bg shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE TRIP MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800 font-heading">Share Itinerary</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Toggle Switch */}
              <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Public sharing</h4>
                  <p className="text-xs text-slate-500">Anyone with the link can view your itinerary.</p>
                </div>

                <button
                  onClick={handleToggleShare}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 outline-none ${
                    shareStatus.is_public ? 'bg-brand' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      shareStatus.is_public ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Share link input */}
              {shareStatus.is_public ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Shareable Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/shared/${shareStatus.share_token}`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none font-mono"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-sm text-slate-500 font-medium flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-400" /> Share status is currently private.
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ItineraryBuilderPage;
