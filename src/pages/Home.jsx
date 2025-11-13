import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (user.role === 'CUSTOMER') {
        // Fetch customer's active orders
        const getCustomerOrdersUseCase = container.getCustomerOrdersUseCase();
        const result = await getCustomerOrdersUseCase.execute({
          page: 0,
          size: 3,
          sort: 'createAt,desc',
        });
        setOrders(result.orders || []);
      } else if (user.role === 'BUILDER') {
        // Fetch newly added orders for builders
        const searchOrdersUseCase = container.getSearchOrdersUseCase();
        const result = await searchOrdersUseCase.execute({
          page: 0,
          size: 3,
        });
        setOrders(result.orders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAuthenticatedContent = () => {
    if (user.role === 'CUSTOMER') {
      return (
        <>
          <section className="dashboard-section">
            <div className="container">
              <div className="dashboard-header">
                <h2>{t('home.myActiveOrders')}</h2>
                {orders.length > 0 && (
                  <Link to="/my-orders">
                    <Button variant="outline">{t('home.viewAll')}</Button>
                  </Link>
                )}
              </div>

              {loading ? (
                <p>{t('common.loading')}</p>
              ) : orders.length === 0 ? (
                <Card className="empty-state">
                  <div className="empty-state-content">
                    <div className="empty-state-icon">📝</div>
                    <h3>{t('home.noActiveOrders')}</h3>
                    <p>{t('home.createFirstOrder')}</p>
                    <Link to="/my-orders">
                      <Button variant="primary">{t('orders.createOrder')}</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="orders-preview-grid">
                  {orders.slice(0, 3).map((order) => (
                    <Card key={order.id} className="order-preview-card">
                      <div className="order-preview-header">
                        <h3>{order.title}</h3>
                        <span className="order-budget">
                          {order.budgetMin}
                          {order.budgetMax ? `-${order.budgetMax}` : '+'} ₸
                        </span>
                      </div>
                      <p className="order-preview-description">{order.description}</p>
                      <div className="order-preview-meta">
                        <span className="order-category">{order.category?.name || 'N/A'}</span>
                        {order.realEstate && (
                          <span className="order-location">
                            📍 {order.realEstate.city}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="quick-actions-section">
            <div className="container">
              <h2>{t('home.quickActions')}</h2>
              <div className="quick-actions-grid">
                <Card className="quick-action-card" onClick={() => navigate('/my-orders')}>
                  <div className="quick-action-icon">📋</div>
                  <h3>{t('navbar.myOrders')}</h3>
                  <p>{t('home.manageOrders')}</p>
                </Card>
                <Card className="quick-action-card" onClick={() => navigate('/estates')}>
                  <div className="quick-action-icon">🏠</div>
                  <h3>{t('navbar.myProperties')}</h3>
                  <p>{t('home.manageProperties')}</p>
                </Card>
                <Card className="quick-action-card" onClick={() => navigate('/services')}>
                  <div className="quick-action-icon">🔧</div>
                  <h3>{t('navbar.services')}</h3>
                  <p>{t('home.browseServices')}</p>
                </Card>
              </div>
            </div>
          </section>
        </>
      );
    } else if (user.role === 'BUILDER') {
      return (
        <>
          <section className="dashboard-section">
            <div className="container">
              <div className="dashboard-header">
                <h2>{t('home.newOrders')}</h2>
                {orders.length > 0 && (
                  <Link to="/orders">
                    <Button variant="outline">{t('home.viewAll')}</Button>
                  </Link>
                )}
              </div>

              {loading ? (
                <p>{t('common.loading')}</p>
              ) : orders.length === 0 ? (
                <Card className="empty-state">
                  <div className="empty-state-content">
                    <div className="empty-state-icon">📦</div>
                    <h3>{t('home.noNewOrders')}</h3>
                    <p>{t('home.checkBackLater')}</p>
                  </div>
                </Card>
              ) : (
                <div className="orders-preview-grid">
                  {orders.slice(0, 3).map((order) => (
                    <Card key={order.id} className="order-preview-card">
                      <div className="order-preview-header">
                        <h3>{order.title}</h3>
                        <span className="order-budget">
                          {order.budgetMin}
                          {order.budgetMax ? `-${order.budgetMax}` : '+'} ₸
                        </span>
                      </div>
                      <p className="order-preview-description">{order.description}</p>
                      <div className="order-preview-meta">
                        <span className="order-category">{order.category?.name || 'N/A'}</span>
                        {order.realEstate && (
                          <span className="order-location">
                            📍 {order.realEstate.city}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="quick-actions-section">
            <div className="container">
              <h2>{t('home.quickActions')}</h2>
              <div className="quick-actions-grid">
                <Card className="quick-action-card" onClick={() => navigate('/orders')}>
                  <div className="quick-action-icon">🔍</div>
                  <h3>{t('navbar.orders')}</h3>
                  <p>{t('home.findNewOrders')}</p>
                </Card>
                <Card className="quick-action-card" onClick={() => navigate('/offers')}>
                  <div className="quick-action-icon">💼</div>
                  <h3>{t('navbar.myOffers')}</h3>
                  <p>{t('home.manageOffers')}</p>
                </Card>
                <Card className="quick-action-card" onClick={() => navigate('/profile')}>
                  <div className="quick-action-icon">👤</div>
                  <h3>{t('home.profile')}</h3>
                  <p>{t('home.updateProfile')}</p>
                </Card>
              </div>
            </div>
          </section>
        </>
      );
    }
  };

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
            {!isAuthenticated ? (
              <>
                <p className="hero-description">
                  {t('home.description')}
                </p>
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
              </>
            ) : (
              <div className="hero-welcome">
                <h2>{t('home.welcomeBack')}, {user?.fullName}!</h2>
              </div>
            )}
          </div>
        </div>
      </section>

      {isAuthenticated ? (
        renderAuthenticatedContent()
      ) : (
        <>
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

          <section className="stats-section">
            <div className="container">
              <h2 className="stats-title">{t('home.whyShanyrak')}</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">1000+</div>
                  <div className="stat-label">{t('home.activeUsers')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">500+</div>
                  <div className="stat-label">{t('home.completedJobs')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">50+</div>
                  <div className="stat-label">{t('home.serviceCategories')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">4.8★</div>
                  <div className="stat-label">{t('home.averageRating')}</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
