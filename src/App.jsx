import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Estates from './pages/Estates';
import Orders from './pages/Orders';
import Offers from './pages/Offers';
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

            {/* Protected routes - will be implemented in next steps */}
            <Route
              path="/estates"
              element={
                <PrivateRoute>
                  <Estates />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <PrivateRoute>
                  <Offers />
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
