import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Users, ShieldCheck, BarChart3, Compass, Map, Globe, ShieldAlert, DollarSign } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safety check: redirect non-admins immediately
    if (user && !user.is_admin) {
      alert("Unauthorized access. Admin privileges required.");
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/api/admin/stats');
        setStats(statsRes.data);

        const citiesRes = await api.get('/api/admin/cities/popular');
        setPopularCities(citiesRes.data);

        const actsRes = await api.get('/api/admin/activities/popular');
        setPopularActivities(actsRes.data);

        const usersRes = await api.get('/api/admin/users');
        setUsersList(usersRes.data);
      } catch (err) {
        console.error("Error loading admin dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Admin Header */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 mb-8">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shadow-sm border border-rose-100/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Admin & Platform Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Track app adoption, user accounts, and popular destinations.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
              <span className="text-xl font-extrabold text-slate-800">{stats?.total_users || 0}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand/10 text-brand rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Trips</span>
              <span className="text-xl font-extrabold text-slate-800">{stats?.total_trips || 0}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Stops</span>
              <span className="text-xl font-extrabold text-slate-800">{stats?.total_stops || 0}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trip Copies</span>
              <span className="text-xl font-extrabold text-slate-800">{stats?.total_copies || 0}</span>
            </div>
          </div>

        </div>

        {/* Popular items section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Top Cities */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5 font-heading">
              <Globe className="w-5 h-5 text-brand" /> Top Cities by stop counts
            </h2>
            {popularCities.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No stop data compiled yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {popularCities.map((item, idx) => (
                  <div key={item.city_id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-slate-850 text-sm block">{item.name}</span>
                        <span className="text-xs font-semibold text-slate-400">{item.country}</span>
                      </div>
                    </div>
                    <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl text-xs">
                      {item.count} stops
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Activities */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5 font-heading">
              <Compass className="w-5 h-5 text-emerald-500" /> Popular Scheduled Activities
            </h2>
            {popularActivities.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No activity schedule data compiled yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {popularActivities.map((item, idx) => (
                  <div key={item.activity_id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-slate-850 text-sm block">{item.name}</span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5" /> {item.cost}
                        </span>
                      </div>
                    </div>
                    <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl text-xs">
                      {item.count} schedules
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* User Account Registry */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5 font-heading">
            <Users className="w-5 h-5 text-slate-650" /> User Accounts Registry
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="text-sm hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold uppercase text-slate-600 overflow-hidden border border-slate-200">
                        {usr.photo_url ? (
                          <img src={usr.photo_url} alt={usr.name} className="w-full h-full object-cover" />
                        ) : (
                          usr.name.charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-slate-700">{usr.name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{usr.email}</td>
                    <td className="py-4 px-4">
                      {usr.is_admin ? (
                        <span className="bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" /> Administrator
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full w-fit block">
                          Standard User
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
