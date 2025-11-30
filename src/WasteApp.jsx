import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import WasteNavbar from './waste-pages/WasteNavbar';
import WasteBottomNav from './waste-pages/WasteBottomNav';
import PrivateRoute from './components/PrivateRoute';
import WasteHome from './waste-pages/WasteHome';
import WasteDetail from './waste-pages/WasteDetail';
import WasteMyAds from './waste-pages/WasteMyAds';
import WasteProfile from './waste-pages/WasteProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function WasteApp() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app">
          <WasteNavbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<WasteHome />} />
              <Route path="/waste/:id" element={<WasteDetail />} />
              <Route
                path="/my-ads"
                element={
                  <PrivateRoute allowedRoles={['BUILDER', 'CUSTOMER']}>
                    <WasteMyAds />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute allowedRoles={['BUILDER', 'CUSTOMER']}>
                    <WasteProfile />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <WasteBottomNav />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default WasteApp;
