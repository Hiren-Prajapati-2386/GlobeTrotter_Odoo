import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Compass, Calendar, MapPin, DollarSign, Clock, Copy, Check, ChevronRight, Lock, Sparkles, LogIn } from 'lucide-react';

const SharedTripPage = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchSharedDetails = async () => {
      try {
        const res = await api.get(`/api/shared/${shareToken}`);
        setTrip(res.data);
      } catch (err) {
        console.error("Error loading shared trip", err);
        setError(err.response?.data?.detail || "Shared itinerary not found or is private.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedDetails();
  }, [shareToken]);

  const handleCopyTrip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Force redirect to login
      alert("Please log in or sign up first to copy this trip to your dashboard!");
      navigate('/login');
      return;
    }

    setIsCopying(true);
    try {
      const res = await api.post(`/api/shared/${shareToken}/copy`);
      setIsCopied(true);
      setTimeout(() => {
        navigate(`/trip/${res.data.id}`);
      }, 1500);
    } catch (err) {
      alert("Failed to copy shared trip. Please make sure you are logged in.");
    } finally {
      setIsCopying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
        Loading Shared Itinerary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Lock className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-700">{error}</h2>
        <Link to="/login" className="bg-brand text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:shadow-lg transition">
          Sign In to GlobeTrotter
        </Link>
      </div>
    );
  }

  // Sort stops by order_index
  const orderedStops = trip?.stops ? [...trip.stops].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* Basic Public Top Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand text-white p-2 rounded-xl custom-gradient-bg">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">GlobeTrotter Shared</span>
          </div>

          <Link to="/login" className="flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            <LogIn className="w-4 h-4" /> Log In / Sign Up
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        
        {/* Banner Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full text-xs font-bold w-fit uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Shared Adventure
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{trip?.name}</h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">{trip?.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip?.start_date} to {trip?.end_date}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {orderedStops.length} Stops
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyTrip}
            disabled={isCopying || isCopied}
            className="bg-brand hover:bg-brand-dark text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition duration-200 flex items-center gap-2 custom-gradient-bg relative z-10 disabled:opacity-85"
          >
            {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {isCopying ? 'Copying...' : isCopied ? 'Trip Cloned!' : 'Copy Itinerary'}
          </button>
        </div>

        {/* Vertical stops view */}
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 font-heading">
          <Compass className="w-6 h-6 text-brand" /> Travel Stop Timeline
        </h2>

        {orderedStops.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-500 font-medium shadow-sm">
            This shared trip doesn't have any stops defined yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8 pt-2">
            {orderedStops.map((stop, index) => (
              <div key={stop.id} className="relative">
                
                {/* Node badge */}
                <div className="absolute -left-[37px] top-0.5 bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow custom-gradient-bg">
                  {index + 1}
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                  
                  {/* Stop header */}
                  <div className="flex items-center gap-3">
                    {stop.city?.image_url && (
                      <img
                        src={stop.city.image_url}
                        alt={stop.city.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1">
                        {stop.city?.name}
                        <span className="text-xs font-semibold text-slate-400">({stop.city?.country})</span>
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {stop.start_date} to {stop.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Stop activities */}
                  {stop.trip_activities?.length > 0 && (
                    <div className="pt-3 border-t border-slate-50 space-y-2">
                      {stop.trip_activities.map((tripAct) => (
                        <div
                          key={tripAct.id}
                          className="flex justify-between items-center gap-4 bg-slate-50/60 border border-slate-100 px-4 py-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-brand-light text-brand px-2 py-1 rounded-lg text-xs font-bold">
                              {tripAct.activity?.category || 'General'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 leading-tight">
                                {tripAct.activity?.name}
                              </span>
                              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mt-1">
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="w-3.5 h-3.5" /> {tripAct.scheduled_date}
                                </span>
                                {tripAct.scheduled_time && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3.5 h-3.5" /> {tripAct.scheduled_time}
                                  </span>
                                )}
                                <span className="text-slate-600 font-bold flex items-center gap-0.5">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {tripAct.cost_override !== null ? tripAct.cost_override : tripAct.activity?.cost}
                                </span>
                              </div>
                              {tripAct.notes && (
                                <p className="text-xs text-slate-500 italic mt-1 font-medium">
                                  Note: {tripAct.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SharedTripPage;
