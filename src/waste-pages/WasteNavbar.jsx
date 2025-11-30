import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './WasteNavbar.css';

const WasteNavbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const languages = [
    { code: 'ru', label: 'RU', flag: '🇷🇺', name: 'Русский' },
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'kk', label: 'KZ', flag: '🇰🇿', name: 'Қазақша' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  const handleNavClick = (e, path) => {
    if (isActive(path)) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <nav className="waste-navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand" onClick={(e) => handleNavClick(e, '/')}>
            <div className="brand-content">
              <div className="waste-icon">♻️</div>
              <h2>{t.waste.title}</h2>
            </div>
          </Link>

          <div className="navbar-menu">
            <div className="navbar-links">
              <Link
                to="/"
                className={`navbar-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/')}
              >
                {t.navbar.home}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-ads"
                  className={`navbar-link ${isActive('/my-ads') ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, '/my-ads')}
                >
                  {t.waste.myAds}
                </Link>
              )}
            </div>

            <div className="navbar-right">
              {isAuthenticated && (
                <div className="navbar-user">
                  <Link
                    to="/profile"
                    className={`navbar-user-name clickable ${isActive('/profile') ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, '/profile')}
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.fullName || user?.phone}
                  </Link>
                </div>
              )}

              {/* Language Dropdown */}
              <div className="language-dropdown">
                <button
                  className="language-dropdown-trigger"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsLanguageDropdownOpen(false), 200)}
                >
                  <span className="language-flag">{currentLanguage?.flag}</span>
                  <span className="language-code">{currentLanguage?.label}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isLanguageDropdownOpen && (
                  <div className="language-dropdown-menu">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`language-dropdown-item ${language === lang.code ? 'active' : ''}`}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div className="navbar-auth-buttons">
                  <Link to="/login">
                    <button className="btn-auth">{t.navbar.signIn}</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default WasteNavbar;
