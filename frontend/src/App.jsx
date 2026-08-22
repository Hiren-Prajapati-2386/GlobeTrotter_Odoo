import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import BudgetPage from './pages/BudgetPage';
import SharedTripPage from './pages/SharedTripPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CitiesPage from './pages/CitiesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<AuthPage />} />
            
            {/* Public share itinerary page */}
            <Route path="/shared/:shareToken" element={<SharedTripPage />} />

            {/* Protected Client Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/trip/:id" 
              element={
                <ProtectedRoute>
                  <ItineraryBuilderPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/trip/:id/budget" 
              element={
                <ProtectedRoute>
                  <BudgetPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/cities" 
              element={
                <ProtectedRoute>
                  <CitiesPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/activities" 
              element={
                <ProtectedRoute>
                  <ActivitiesPage />
                </ProtectedRoute>
              } 
            />

            {/* Admin Analytics Panel */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;