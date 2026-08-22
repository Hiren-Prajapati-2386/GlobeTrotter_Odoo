import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Compass, Plane, Calendar, MapPin, DollarSign, Share2, ArrowRight, Star, Award, Users } from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/api/cities/');
        // Show up to 3 popular cities
        setPopularCities(res.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching popular destinations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-hidden relative font-sans">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-500/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand/10 blur-[150px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>

      {/* Floating morphing blob in the hero area */}
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-gradient-to-tr from-brand/20 to-sky-500/20 blur-xl rounded-full animate-morph opacity-70 hidden md:block"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30 animate-float">
            <Compass className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg shadow-brand/25 transition duration-200 flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white font-bold text-sm transition">
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border border-white/10 backdrop-blur-md transition duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-sky-400 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              Your Ultimate Travel Companion
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-slideUp">
              Embark on Your <br />
              <span className="bg-gradient-to-r from-sky-400 via-brand to-indigo-500 bg-clip-text text-transparent">
                Next Adventure
              </span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Create complex multi-city itineraries, manage daily budgets automatically, discover sightseeing spots, and share travel plans seamlessly.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <Link
                to={user ? "/dashboard" : "/login"}
                className="px-8 py-4 bg-brand hover:bg-brand-dark text-white font-extrabold rounded-2xl shadow-xl shadow-brand/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Start Planning Free
                <Plane className="w-5 h-5 rotate-45" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-200 font-extrabold rounded-2xl border border-white/10 transition-all duration-300 backdrop-blur-md"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero Visual side */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="w-72 h-72 rounded-full bg-indigo-500/10 absolute animate-pulse-slow"></div>
            <div className="relative glass-card-dark p-6 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full animate-float space-y-6">
              <div className="h-48 rounded-2xl overflow-hidden relative shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80"
                  alt="Travel Presets"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 text-white">
                  Demo Trip
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">European Explorer 2026</h3>
                <div className="flex gap-2 text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 12 Days</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 3 Cities</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Budget</span>
                <span className="font-extrabold text-emerald-400">$1,850.00</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature cards Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Designed for Modern Travelers
          </h2>
          <p className="text-slate-400">
            Everything you need to organize your travel schedules and manage your budgets in one premium interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <MapPin className="w-6 h-6 text-sky-400" />,
              title: "Multi-City Stops",
              desc: "Build sequential stops with custom stay durations, flight links, and sightseeing activities."
            },
            {
              icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
              title: "Budget Tracker",
              desc: "Keep strict control over your accommodation, transit, and daily expenditure."
            },
            {
              icon: <Share2 className="w-6 h-6 text-brand" />,
              title: "Public Sharing",
              desc: "Instantly generate secure public links to share your curated travel itineraries with friends."
            },
            {
              icon: <Compass className="w-6 h-6 text-indigo-400" />,
              title: "Local Explorers",
              desc: "Query and find popular sightseeing classes, local food classes, and nature events."
            }
          ].map((feat, i) => (
            <div
              key={i}
              className="glass-card-dark p-8 rounded-3xl border border-white/5 hover:border-white/10 hover-glow transition-all duration-300 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Popular Destinations</h2>
            <p className="text-slate-400">Handpicked popular hotspots requested by our community</p>
          </div>
          <Link
            to={user ? "/cities" : "/login"}
            className="text-sm font-bold text-brand hover:text-brand-light flex items-center gap-1.5 group"
          >
            Browse All Cities <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-white/5 border border-white/5 animate-pulse"></div>
            ))
          ) : popularCities.length === 0 ? (
            // Presets if DB is empty
            [
              { name: "Paris", country: "France", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", cost: 85 },
              { name: "Tokyo", country: "Japan", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf", cost: 90 },
              { name: "Rome", country: "Italy", url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5", cost: 75 }
            ].map((city, i) => (
              <div key={i} className="group relative h-80 rounded-3xl overflow-hidden border border-white/5 shadow-lg shadow-black/30">
                <img src={city.url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                  <div>
                    <h3 className="text-xl font-bold text-white">{city.name}</h3>
                    <span className="text-xs text-slate-400 font-semibold">{city.country}</span>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                    ${city.cost}/day
                  </span>
                </div>
              </div>
            ))
          ) : (
            popularCities.map((city) => (
              <div key={city.id} className="group relative h-80 rounded-3xl overflow-hidden border border-white/5 shadow-lg shadow-black/30">
                <img
                  src={city.image_url || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80"}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                  <div>
                    <h3 className="text-xl font-bold text-white">{city.name}</h3>
                    <span className="text-xs text-slate-400 font-semibold">{city.country}</span>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                    ${Math.round(city.cost_index)}/day
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Star className="w-6 h-6 text-amber-400" />, count: "4.9 / 5.0", label: "Explorer Rating Score" },
            { icon: <Users className="w-6 h-6 text-sky-400" />, count: "12,000+", label: "Active Itineraries Created" },
            { icon: <Award className="w-6 h-6 text-indigo-400" />, count: "100%", label: "Free Custom Planning" }
          ].map((metric, i) => (
            <div key={i} className="glass-card-dark p-8 rounded-3xl border border-white/5 flex items-center gap-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0 animate-float-delayed">
                {metric.icon}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">{metric.count}</h3>
                <p className="text-slate-400 text-sm font-semibold">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <span>&copy; 2026 GlobeTrotter Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
