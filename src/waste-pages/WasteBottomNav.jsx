import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './WasteBottomNav.css';

const WasteBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="waste-bottom-nav">
      <Link
        to="/"
        className={`bottom-nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">{t.navbar.home}</span>
      </Link>

      {isAuthenticated && (
        <>
          <Link
            to="/my-ads"
            className={`bottom-nav-item ${isActive('/my-ads') ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">📦</span>
            <span className="bottom-nav-label">{t.waste.myAds}</span>
          </Link>

          <Link
            to="/profile"
            className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">👤</span>
            <span className="bottom-nav-label">{t.navbar.profile}</span>
          </Link>
        </>
      )}

      {!isAuthenticated && (
        <Link to="/login" className="bottom-nav-item">
          <span className="bottom-nav-icon">🔑</span>
          <span className="bottom-nav-label">{t.navbar.signIn}</span>
        </Link>
      )}
    </nav>
  );
};

export default WasteBottomNav;
