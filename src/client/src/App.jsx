import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CapacityPage from './pages/CapacityPage';
import AddCapacityPage from './pages/AddCapacityPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ShipmentDetailPage from './pages/ShipmentDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import VerifyPage from './pages/VerifyPage';
import ProfilePage from './pages/ProfilePage';

// Documents page - simple placeholder, renders from backend-generated docs
import DocumentsPage from './pages/DocumentsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,90,31,0.3)', borderTopColor: '#FF5A1F', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading BharatLCL...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppLayout({ children, showFooter = true }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
      <Route path="/login" element={<PublicRoute><AppLayout showFooter={false}><LoginPage /></AppLayout></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AppLayout showFooter={false}><RegisterPage /></AppLayout></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/capacity" element={<PrivateRoute><AppLayout><CapacityPage /></AppLayout></PrivateRoute>} />
      <Route path="/capacity/add" element={<PrivateRoute><AppLayout><AddCapacityPage /></AppLayout></PrivateRoute>} />
      <Route path="/shipments" element={<PrivateRoute><AppLayout><ShipmentsPage /></AppLayout></PrivateRoute>} />
      <Route path="/shipments/:id" element={<PrivateRoute><AppLayout><ShipmentDetailPage /></AppLayout></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute><AppLayout><PaymentsPage /></AppLayout></PrivateRoute>} />
      <Route path="/documents" element={<PrivateRoute><AppLayout><DocumentsPage /></AppLayout></PrivateRoute>} />
      <Route path="/verify" element={<PrivateRoute><AppLayout><VerifyPage /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
