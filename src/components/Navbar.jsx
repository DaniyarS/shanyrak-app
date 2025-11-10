import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'kk', label: 'KK' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <h2>Shanyrak</h2>
          </Link>

          <div className="navbar-menu">
            {/* Language Selector */}
            <div className="language-selector">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-btn ${language === lang.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <>
                    <Link to="/services" className="navbar-link">
                      {t('navbar.services')}
                    </Link>
                    <Link to="/my-orders" className="navbar-link">
                      {t('navbar.myOrders')}
                    </Link>
                    <Link to="/estates" className="navbar-link">
                      {t('navbar.myProperties')}
                    </Link>
                  </>
                )}
                {user?.role === 'BUILDER' && (
                  <>
                    <Link to="/orders" className="navbar-link">
                      {t('navbar.orders')}
                    </Link>
                    <Link to="/offers" className="navbar-link">
                      {t('navbar.myOffers')}
                    </Link>
                  </>
                )}
                <div className="navbar-user">
                  {user?.role === 'BUILDER' ? (
                    <Link to="/profile" className="navbar-user-name clickable">
                      {user?.fullName}
                    </Link>
                  ) : (
                    <span className="navbar-user-name">{user?.fullName}</span>
                  )}
                  <Button variant="outline" size="small" onClick={handleLogout}>
                    {t('navbar.logout')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="small">
                    {t('navbar.signIn')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="small">
                    {t('navbar.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
