import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Estates from './pages/Estates';
import Services from './pages/Services';
import CustomerOrders from './pages/CustomerOrders';
import BuilderOrders from './pages/BuilderOrders';
import ProfileRouter from './pages/ProfileRouter';
import BuilderDetail from './pages/BuilderDetail';
import Offers from './pages/Offers';
import Contracts from './pages/Contracts';
import Unauthorized from './pages/Unauthorized';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes with role-based access control */}
            <Route path="/services" element={<Services />} />
            <Route
              path="/estates"
              element={
                <PrivateRoute allowedRoles={['CUSTOMER']}>
                  <Estates />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute allowedRoles={['CUSTOMER']}>
                  <CustomerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute allowedRoles={['BUILDER']}>
                  <BuilderOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <PrivateRoute allowedRoles={['BUILDER']}>
                  <Offers />
                </PrivateRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <PrivateRoute allowedRoles={['BUILDER', 'CUSTOMER']}>
                  <Contracts />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['BUILDER', 'CUSTOMER']}>
                  <ProfileRouter />
                </PrivateRoute>
              }
            />
            <Route
              path="/builders/:builderId"
              element={
                <PrivateRoute allowedRoles={['CUSTOMER']}>
                  <BuilderDetail />
                </PrivateRoute>
              }
            />

            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
