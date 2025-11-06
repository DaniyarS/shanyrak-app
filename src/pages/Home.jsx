import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('home.title')}
            </h1>
            <p className="hero-subtitle">
              {t('home.subtitle')}
            </p>
            <p className="hero-description">
              {t('home.description')}
            </p>
            {!isAuthenticated ? (
              <div className="hero-actions">
                <Link to="/register">
                  <Button variant="primary" size="large">
                    {t('home.getStarted')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="large">
                    {t('navbar.signIn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hero-welcome">
                <h2>{t('home.welcomeBack')}, {user?.fullName}!</h2>
                <div className="hero-actions">
                  <Link to="/orders">
                    <Button variant="primary" size="large">
                      {t('home.browseOrders')}
                    </Button>
                  </Link>
                  <Link to="/estates">
                    <Button variant="outline" size="large">
                      {t('navbar.myProperties')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="features-title">{t('home.howItWorks')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>{t('home.feature1Title')}</h3>
              <p>{t('home.feature1Text')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>{t('home.feature2Title')}</h3>
              <p>{t('home.feature2Text')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>{t('home.feature3Title')}</h3>
              <p>{t('home.feature3Text')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>{t('home.feature4Title')}</h3>
              <p>{t('home.feature4Text')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
