import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Temporary placeholders (we will build real pages next)
const AuthPage = () => <div className="p-10 text-center text-2xl font-bold">Login / Register Page (Coming Next)</div>;
const Dashboard = () => <div className="p-10 text-center text-2xl font-bold">My Trips Dashboard (Protected)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Main layout container with Tailwind styling */}
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root (/) to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;