import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import BuilderCard from '../components/services/BuilderCard';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showcaseBuilders, setShowcaseBuilders] = useState([]);
  const [showcaseBuildersLoading, setShowcaseBuildersLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t('home.slider.slide1.title'),
      subtitle: t('home.slider.slide1.subtitle'),
      description: t('home.slider.slide1.description'),
    },
    {
      title: t('home.slider.slide2.title'),
      subtitle: t('home.slider.slide2.subtitle'),
      description: t('home.slider.slide2.description'),
    },
    {
      title: t('home.slider.slide3.title'),
      subtitle: t('home.slider.slide3.subtitle'),
      description: t('home.slider.slide3.description'),
    },
  ];

  // Auto-rotate hero slider
  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, slides.length]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      // Load showcase builders for unauthorized users
      fetchShowcaseBuilders();
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

  const fetchShowcaseBuilders = useCallback(async () => {
    try {
      setShowcaseBuildersLoading(true);
      
      const searchBuildersUseCase = container.getSearchBuildersUseCase();
      const result = await searchBuildersUseCase.execute({
        page: 0,
        size: 6 // Show 3 builders in showcase
      });
      
      if (result.success) {
        const builders = result.builders || [];
        setShowcaseBuilders(builders);
      }
    } catch (error) {
      console.error('Error fetching showcase builders:', error);
    } finally {
      setShowcaseBuildersLoading(false);
    }
  }, []);

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
                  {orders.slice(0, 3).map((order) => {
                    // Helper function to translate unit types from English API response to current locale
                    const getLocalizedUnitLabel = (unit) => {
                      if (!unit) return '';
                      
                      const unitTranslationMap = {
                        // Linear units
                        'meter': t('orders.units.perMeter'),
                        'perMeter': t('orders.units.perMeter'),
                        'permeter': t('orders.units.perMeter'),
                        'm': t('orders.units.perMeter'),

                        // Area-based units (API returns these)
                        'm2': t('offers.perM2'),
                        'perM2': t('offers.perM2'),
                        'areaM2': t('offers.perM2'),
                        'aream2': t('offers.perM2'),
                        'sqm': t('offers.perM2'),
                        'meter2': t('offers.perM2'),
                        'square_meter': t('offers.perM2'),
                        'square meter': t('offers.perM2'),
                        'permetersquare': t('orders.units.perMeterSquare'),
                        'permeter²': t('orders.units.perMeterSquare'),
                        'perMeterSquare': t('orders.units.perMeterSquare'),

                        // Volume-based units
                        'm3': t('orders.units.perMeterCube'),
                        'perM3': t('orders.units.perMeterCube'),
                        'perMeterCube': t('orders.units.perMeterCube'),
                        'permeter³': t('orders.units.perMeterCube'),
                        'cubic_meter': t('orders.units.perMeterCube'),
                        'cubic meter': t('orders.units.perMeterCube'),

                        // Time-based units
                        'hour': t('offers.perHour'),
                        'hr': t('offers.perHour'),
                        'hours': t('offers.perHour'),
                        'perHour': t('offers.perHour'),
                        'day': t('offers.perDay'),
                        'daily': t('offers.perDay'),
                        'days': t('offers.perDay'),
                        'perDay': t('offers.perDay'),
                        
                        // Quantity-based units
                        'unit': t('offers.perUnit'),
                        'perUnit': t('offers.perUnit'),
                        'piece': t('offers.perItem'),
                        'pieces': t('offers.perItem'),
                        'pcs': t('offers.perItem'),
                        'item': t('offers.perItem'),
                        'items': t('offers.perItem'),
                        'each': t('offers.perItem'),
                        'peritem': t('orders.units.perItem'),
                        'perItem': t('orders.units.perItem'),
                        
                        // Fixed price
                        'fixed': t('offers.fixedPrice'),
                        'total': t('orders.units.total'),
                        'lump_sum': t('offers.fixedPrice'),
                        'flat_rate': t('offers.fixedPrice'),
                      };
                      
                      // Check both original case and lowercase
                      return unitTranslationMap[unit] || unitTranslationMap[unit.toLowerCase()] || unit;
                    };

                    // Helper function for price display
                    const getPriceDisplay = () => {
                      if (order.priceType === 'FIXED' && order.price) {
                        const unitLabel = getLocalizedUnitLabel(order.unit);
                        return `${order.price} ₸${unitLabel ? ` / ${unitLabel}` : ''}`;
                      }
                      
                      // Fallback to legacy budget fields
                      if (order.budgetMin || order.budgetMax) {
                        const min = order.budgetMin || 0;
                        const max = order.budgetMax;
                        return max && max > 0 ? `${min}-${max} ₸` : `${min}+ ₸`;
                      }
                      
                      return t('orders.negotiable');
                    };

                    return (
                      <Card key={order.id} className="order-preview-card" onClick={() => navigate('/my-orders')}>
                        <div className="order-preview-header">
                          <span className="order-category-badge">
                            {order.category?.name || t('orders.uncategorized')}
                          </span>
                          <span className={`order-price-badge ${order.priceType === 'FIXED' ? 'fixed' : 'negotiable'}`}>
                            {getPriceDisplay()}
                          </span>
                        </div>
                        
                        {order.title && (
                          <h3 className="order-preview-title">{order.title}</h3>
                        )}
                        
                        <p className="order-preview-description">{order.description}</p>
                        
                        <div className="order-preview-details">
                          {order.realEstate && (
                            <>
                              <div className="order-detail-row">
                                <span className="detail-icon">📍</span>
                                <span>
                                  {order.realEstate.city}
                                  {order.realEstate.district && `, ${order.realEstate.district}`}
                                </span>
                              </div>
                              <div className="order-detail-row">
                                <span className="detail-icon">🏠</span>
                                <span>
                                  {t(`estates.${order.realEstate.kind?.toLowerCase()}`) || order.realEstate.kind}
                                  {order.realEstate.areaM2 && ` - ${order.realEstate.areaM2} m²`}
                                </span>
                              </div>
                            </>
                          )}
                          
                          {order.status && (
                            <div className="order-detail-row">
                              <span className="detail-icon">📊</span>
                              <span className={`order-status status-${order.status.toLowerCase()}`}>
                                {t(`orders.status.${order.status.toLowerCase()}`) || order.status}
                              </span>
                            </div>
                          )}
                          
                          {order.createdAt && (
                            <div className="order-detail-row">
                              <span className="detail-icon">📅</span>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {order.offersCount > 0 && (
                            <div className="order-detail-row">
                              <span className="detail-icon">💼</span>
                              <span>{order.offersCount} {t('orders.offers')}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
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
                  {orders.slice(0, 3).map((order) => {
                    // Helper function to translate unit types from English API response to current locale
                    const getUnitLabel = (unit) => {
                      if (!unit) return '';
                      
                      const unitTranslationMap = {
                        // Linear units
                        'meter': t('orders.units.perMeter'),
                        'perMeter': t('orders.units.perMeter'),
                        'permeter': t('orders.units.perMeter'),
                        'm': t('orders.units.perMeter'),

                        // Area-based units (API returns these)
                        'm2': t('offers.perM2'),
                        'perM2': t('offers.perM2'),
                        'areaM2': t('offers.perM2'),
                        'aream2': t('offers.perM2'),
                        'sqm': t('offers.perM2'),
                        'meter2': t('offers.perM2'),
                        'square_meter': t('offers.perM2'),
                        'square meter': t('offers.perM2'),
                        'permetersquare': t('orders.units.perMeterSquare'),
                        'permeter²': t('orders.units.perMeterSquare'),
                        'perMeterSquare': t('orders.units.perMeterSquare'),

                        // Volume-based units
                        'm3': t('orders.units.perMeterCube'),
                        'perM3': t('orders.units.perMeterCube'),
                        'perMeterCube': t('orders.units.perMeterCube'),
                        'permeter³': t('orders.units.perMeterCube'),
                        'cubic_meter': t('orders.units.perMeterCube'),
                        'cubic meter': t('orders.units.perMeterCube'),

                        // Time-based units
                        'hour': t('offers.perHour'),
                        'hr': t('offers.perHour'),
                        'hours': t('offers.perHour'),
                        'perHour': t('offers.perHour'),
                        'day': t('offers.perDay'),
                        'daily': t('offers.perDay'),
                        'days': t('offers.perDay'),
                        'perDay': t('offers.perDay'),
                        
                        // Quantity-based units
                        'unit': t('offers.perUnit'),
                        'perUnit': t('offers.perUnit'),
                        'piece': t('offers.perItem'),
                        'pieces': t('offers.perItem'),
                        'pcs': t('offers.perItem'),
                        'item': t('offers.perItem'),
                        'items': t('offers.perItem'),
                        'each': t('offers.perItem'),
                        'peritem': t('orders.units.perItem'),
                        'perItem': t('orders.units.perItem'),
                        
                        // Fixed price
                        'fixed': t('offers.fixedPrice'),
                        'total': t('orders.units.total'),
                        'lump_sum': t('offers.fixedPrice'),
                        'flat_rate': t('offers.fixedPrice'),
                      };
                      
                      // Check both original case and lowercase
                      return unitTranslationMap[unit] || unitTranslationMap[unit.toLowerCase()] || unit;
                    };

                    return (
                    <Card key={order.id} className="order-preview-card" onClick={() => navigate(`/orders`)}>
                      <div className="order-preview-header">
                        <span className="order-category-badge">{order.category?.name || t('common.notAvailable')}</span>
                        <span className={`order-price-badge ${order.priceType === 'FIXED' ? 'fixed' : 'negotiable'}`}>
                          {order.priceType === 'FIXED' && order.price
                            ? `${order.price} ₸${order.unit ? `/${getUnitLabel(order.unit)}` : ''}`
                            : t('orders.negotiable')}
                        </span>
                      </div>
                      <p className="order-preview-description">{order.description}</p>
                      <div className="order-preview-details">
                        {order.realEstate && (
                          <>
                            <div className="order-detail-row">
                              <span className="detail-icon">📍</span>
                              <span>{order.realEstate.city}, {order.realEstate.district}</span>
                            </div>
                            <div className="order-detail-row">
                              <span className="detail-icon">🏠</span>
                              <span>{t(`estates.${order.realEstate.kind?.toLowerCase()}`) || order.realEstate.kind} - {order.realEstate.areaM2} m²</span>
                            </div>
                          </>
                        )}
                        {order.createdAt && (
                          <div className="order-detail-row">
                            <span className="detail-icon">📅</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                    );
                  })}
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
            {!isAuthenticated ? (
              <>
                <div className="hero-slider">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                    >
                      <h1 className="hero-title">{slide.title}</h1>
                      <p className="hero-subtitle">{slide.subtitle}</p>
                      <p className="hero-description">{slide.description}</p>
                    </div>
                  ))}
                </div>
                <div className="hero-slider-dots">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
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
              <>
                <h1 className="hero-title">{t('home.title')}</h1>
                <div className="hero-welcome">
                  <h2>
                    {t('home.welcomeBack')},{' '}
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.phone}!
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {isAuthenticated ? (
        renderAuthenticatedContent()
      ) : (
        <>
          <section className="services-showcase">
            <div className="container">
              <div className="services-showcase-content">
                <h2 className="services-showcase-title">{t('home.exploreServices')}</h2>
                <p className="services-showcase-subtitle">{t('home.exploreServicesDescription')}</p>
                
                {showcaseBuildersLoading ? (
                  <div className="showcase-builders-loading">
                    <div className="spinner"></div>
                    <p>{t('common.loading')}</p>
                  </div>
                ) : showcaseBuilders.length === 0 ? (
                  <div className="showcase-builders-empty">
                    <div className="empty-icon">👷‍♂️</div>
                    <p>{t('home.noBuildersAvailable')}</p>
                  </div>
                ) : (
                  <div className="showcase-builders-scroll-container">
                    <div className="showcase-builders-scroll">
                      {showcaseBuilders.map((builder) => (
                        <div key={builder.id} className="showcase-builder-card-wrapper">
                          <BuilderCard
                            builder={builder}
                            avatarUrl={builder.avatarLink}
                            onClick={() => navigate('/services?view=builders')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="services-showcase-actions">
                  <Link to="/services">
                    <Button variant="primary" size="large">
                      {t('home.browseServices')}
                    </Button>
                  </Link>
                  <Link to="/services?view=builders">
                    <Button variant="outline" size="large">
                      {t('home.viewAllBuilders')}
                    </Button>
                  </Link>
                </div>
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

          <section className="stats-section">
            <div className="container">
              <h2 className="stats-title">{t('home.whyShanyrak')}</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">150+</div>
                  <div className="stat-label">{t('home.activeUsers')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">45+</div>
                  <div className="stat-label">{t('home.completedJobs')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">12+</div>
                  <div className="stat-label">{t('home.serviceCategories')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">4.6★</div>
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
