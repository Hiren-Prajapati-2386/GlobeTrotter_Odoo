import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Compass, PlaneTakeoff, KeyRound, ArrowLeft, CheckCircle, Mail, Lock, User as UserIcon } from 'lucide-react';
import api from '../services/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [resetPassword, setResetPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // If a reset token is present in the URL, switch to reset password mode
  const isResetMode = !!token;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (isResetMode) {
        await api.post('/api/auth/reset-password', {
          token,
          new_password: resetPassword
        });
        setMessage('Password has been reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (isForgotPassword) {
        await api.post('/api/auth/forgot-password', { email: formData.email });
        setMessage('If a user with this email exists, a password reset link has been sent to them. Check the server console log for the link.');
      } else if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await register(formData.name, formData.email, formData.password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-955 p-4 relative overflow-hidden font-sans" style={{ backgroundColor: '#090d16' }}>
      {/* Background Graphic elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-brand/10 blur-[130px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-5xl glass-card-dark rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden relative z-10 animate-slideUp">
        
        {/* Left Side - Visual/Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-brand/90 to-indigo-950/90 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080')] bg-cover bg-center"></div>
          
          {/* Animated decorative gradient blob inside hero */}
          <div className="absolute top-[-10%] right-[-10%] w-48 h-48 rounded-full bg-sky-300/20 blur-2xl animate-morph"></div>
          
          <div className="relative z-10 text-center space-y-6">
            <Link to="/" className="inline-block">
              <div className="w-20 h-20 mx-auto bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md animate-float">
                <Compass className="w-10 h-10 text-white" />
              </div>
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">GlobeTrotter</h1>
              <p className="text-sky-200 text-sm max-w-xs mx-auto leading-relaxed">
                Plan custom multi-city journeys, manage complex daily budgets, and share itineraries with ease.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-center">
          <div className="mb-8 text-left animate-fadeIn">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isResetMode 
                ? 'Reset Password' 
                : isForgotPassword 
                  ? 'Forgot Password' 
                  : isLogin 
                    ? 'Welcome Back' 
                    : 'Join the Adventure'}
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              {isResetMode 
                ? 'Please type your new account password below.' 
                : isForgotPassword 
                  ? 'Enter your registered email address to receive a recovery link.' 
                  : isLogin 
                    ? 'Enter your credentials to manage your itineraries.' 
                    : 'Create a free account to customize your travel.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold text-center animate-fadeIn">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left animate-slideUp">
            {isResetMode ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-slate-100 placeholder-slate-600 outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            ) : isForgotPassword ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-slate-100 placeholder-slate-600 outline-none transition"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
            ) : (
              <>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-slate-100 placeholder-slate-600 outline-none transition"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-slate-100 placeholder-slate-600 outline-none transition"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                          setMessage('');
                        }}
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-slate-100 placeholder-slate-600 outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand/25 transition duration-200 flex justify-center items-center gap-2"
            >
              {isLoading ? 'Processing...' : isResetMode ? 'Reset Password' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
              {!isLoading && <PlaneTakeoff className="w-5 h-5 rotate-45" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isResetMode || isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  if (isResetMode) {
                    navigate('/login');
                  }
                  setError('');
                  setMessage('');
                }}
                className="text-brand font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            ) : (
              <>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setMessage('');
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="text-brand font-bold hover:underline outline-none"
                >
                  {isLogin ? 'Sign up for free' : 'Sign in instead'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;