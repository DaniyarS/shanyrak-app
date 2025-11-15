import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
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

  const isDevelopment = import.meta.env.DEV;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand" onClick={(e) => handleNavClick(e, '/')}>
            <div className="brand-content">
              <div className="shanyrak-icon">
                <div className="shanyrak-circle">
                  <div className="shanyrak-cross"></div>
                  <div className="shanyrak-cross rotated"></div>
                </div>
              </div>
              <h2>Shanyrak</h2>
            </div>
          </Link>

          <div className="navbar-menu">
            {isAuthenticated ? (
              <>
                <div className="navbar-links">
                  <Link
                    to="/"
                    className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, '/')}
                  >
                    {t('navbar.home')}
                  </Link>
                  {isDevelopment && (
                    <Link
                      to="/testing"
                      className={`navbar-link navbar-link-testing ${isActive('/testing') ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, '/testing')}
                    >
                      🧪 Testing
                    </Link>
                  )}
                  {user?.role === 'CUSTOMER' && (
                    <>
                      <Link
                        to="/services"
                        className={`navbar-link ${isActive('/services') ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/services')}
                      >
                        {t('navbar.services')}
                      </Link>
                      <Link
                        to="/my-orders"
                        className={`navbar-link ${isActive('/my-orders') ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/my-orders')}
                      >
                        {t('navbar.myOrders')}
                      </Link>
                      <Link
                        to="/estates"
                        className={`navbar-link ${isActive('/estates') ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/estates')}
                      >
                        {t('navbar.myProperties')}
                      </Link>
                    </>
                  )}
                  {user?.role === 'BUILDER' && (
                    <>
                      <Link
                        to="/orders"
                        className={`navbar-link ${isActive('/orders') ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/orders')}
                      >
                        {t('navbar.orders')}
                      </Link>
                      <Link
                        to="/offers"
                        className={`navbar-link ${isActive('/offers') ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/offers')}
                      >
                        {t('navbar.myOffers')}
                      </Link>
                    </>
                  )}
                  {(user?.role === 'CUSTOMER' || user?.role === 'BUILDER') && (
                    <Link
                      to="/contracts"
                      className={`navbar-link ${isActive('/contracts') ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, '/contracts')}
                    >
                      {t('navbar.contracts')}
                    </Link>
                  )}
                </div>

                <div className="navbar-right">
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
                </div>
              </>
            ) : (
              <>
                <div className="navbar-links">
                  <Link
                    to="/"
                    className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, '/')}
                  >
                    {t('navbar.home')}
                  </Link>
                </div>

                <div className="navbar-right">
                  {/* Language Dropdown for non-authenticated users */}
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
