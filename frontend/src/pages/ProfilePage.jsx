import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { User, Mail, Globe, Image, Save, Trash2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    photo_url: user?.photo_url || '',
    language_pref: user?.language_pref || 'en'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const res = await api.put('/api/users/me', formData);
      // Update global context user
      if (setUser) {
        setUser(res.data);
      }
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account.');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 mt-10">
        
        {/* Profile Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand text-2xl font-bold uppercase overflow-hidden border border-brand/20">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                formData.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{user?.name}</h1>
              <p className="text-slate-500 text-sm flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
              </p>
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4" /> {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-slate-400" /> Profile Picture URL
              </label>
              <input
                type="url"
                name="photo_url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.photo_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Language Preference
              </label>
              <select
                name="language_pref"
                value={formData.language_pref}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition text-sm text-slate-700"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-brand text-white font-bold rounded-xl text-sm hover:shadow-lg transition duration-200 custom-gradient-bg"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* DELETE ACCOUNT DOUBLE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
            
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100">
                <ShieldAlert className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-800">Delete Account Permanently?</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                This action is irreversible. All your trips, multi-city stops, and budget profiles will be permanently erased.
              </p>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-50 -mx-6 -mb-6 px-6 py-4 bg-slate-50">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
