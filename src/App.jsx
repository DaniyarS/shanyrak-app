import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Estates from './pages/Estates';
import Services from './pages/Services';
import CustomerOrders from './pages/CustomerOrders';
import BuilderOrders from './pages/BuilderOrders';
import BuilderProfile from './pages/BuilderProfile';
import Offers from './pages/Offers';
import Unauthorized from './pages/Unauthorized';
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
              <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes with role-based access control */}
            <Route
              path="/services"
              element={
                <PrivateRoute allowedRoles={['CUSTOMER']}>
                  <Services />
                </PrivateRoute>
              }
            />
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
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['BUILDER']}>
                  <BuilderProfile />
                </PrivateRoute>
              }
            />

            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
