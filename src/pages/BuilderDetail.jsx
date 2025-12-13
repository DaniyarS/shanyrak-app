import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import './BuilderDetail.css';

const BuilderDetail = () => {
  const { builderId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('BuilderDetail mounted with builderId:', builderId);
    fetchBuilderDetails();
  }, [builderId]);

  const fetchBuilderDetails = async () => {
    try {
      console.log('Fetching builder details for ID:', builderId);
      setLoading(true);
      setError(null);

      const getBuilderUseCase = container.getGetBuilderUseCase();
      const result = await getBuilderUseCase.execute(builderId);

      console.log('Builder fetch result:', result);

      if (result.success && result.builder) {
        console.log('Builder loaded successfully:', result.builder);
        setBuilder(result.builder);
      } else {
        const errorMsg = result.error || 'Failed to load builder details';
        console.error('Builder fetch failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching builder details:', error);
      setError(error.message || 'Failed to load builder details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="builder-detail-page">
        <div className="container">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !builder) {
    console.log('Showing error state. Error:', error, 'Builder:', builder);
    return (
      <div className="builder-detail-page">
        <div className="container">
          <Card>
            <p className="error-message">{error || 'Builder not found'}</p>
            <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
          </Card>
        </div>
      </div>
    );
  }

  console.log('Rendering builder details:', builder);

  try {
    return (
      <div className="builder-detail-page">
        <div className="container">
          <div className="builder-detail-header">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← {t('common.back')}
            </Button>
            <h1>{t('services.builderDetails') || 'Builder Details'}</h1>
          </div>

          <div className="builder-detail-content">
            {/* Main Info Card */}
            <Card className="builder-main-card">
              <div className="builder-header-section">
                <div className="builder-avatar">
                  {builder.avatarLink ? (
                    <img src={builder.avatarLink} alt={builder.fullName || 'Builder'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {((builder.fullName || builder.login || 'B').charAt(0) || 'B').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="builder-header-info">
                  <div className="builder-name-status">
                    <h2>{builder.fullName || builder.login || 'Unknown'}</h2>
                    <span className={`status-indicator ${builder.available ? 'online' : 'offline'}`}></span>
                    <span className="status-text">
                      {builder.available ? (t('services.available') || 'Available') : (t('services.notAvailable') || 'Not Available')}
                    </span>
                  </div>
                  <div className="builder-rating-section">
                    <span className="rating-stars">⭐ {typeof builder.ratingAvg === 'number' ? builder.ratingAvg.toFixed(1) : '0.0'}</span>
                    <span className="rating-label">{t('services.rating') || 'Rating'}</span>
                  </div>
                </div>
              </div>

              <div className="builder-contact-section">
                {builder.phone && (
                  <a href={`tel:${builder.phone}`} className="contact-button phone">
                    📞 {builder.phone}
                  </a>
                )}
                {builder.email && (
                  <a href={`mailto:${builder.email}`} className="contact-button email">
                    ✉️ {builder.email}
                  </a>
                )}
              </div>
            </Card>

            {/* About Section */}
            {builder.aboutMe && (
              <Card className="builder-section-card">
                <h3>{t('services.aboutMe') || 'About Me'}</h3>
                <p className="about-text">{builder.aboutMe}</p>
              </Card>
            )}

            {/* Professional Info */}
            <Card className="builder-section-card">
              <h3>{t('profile.professionalInfo') || 'Professional Information'}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{t('services.experienceYears') || 'Experience'}:</span>
                  <span className="info-value">{builder.experienceYears || 0} {t('services.years') || 'years'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('services.jobsDone') || 'Jobs Done'}:</span>
                  <span className="info-value">{builder.jobsDone || 0} {t('services.jobs') || 'jobs'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('services.city') || 'City'}:</span>
                  <span className="info-value">{builder.city || t('common.notAvailable')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('services.district') || 'District'}:</span>
                  <span className="info-value">{builder.district || t('common.notAvailable')}</span>
                </div>
              </div>
            </Card>

            {/* Price List */}
            {builder.priceList && Array.isArray(builder.priceList) && builder.priceList.length > 0 && (
              <Card className="builder-section-card">
                <h3>Price List</h3>
                <div className="price-list">
                  {builder.priceList.map((item, index) => {
                    // Handle category being an object or a string
                    const categoryName = typeof item.category === 'object' && item.category !== null
                      ? (item.category.name || 'Service')
                      : (item.category || 'Service');

                    return (
                      <div key={index} className="price-item">
                        <span className="price-category">{categoryName}</span>
                        <span className="price-amount">{item.price || '0'} ₸</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering builder details:', renderError);
    return (
      <div className="builder-detail-page">
        <div className="container">
          <Card>
            <p className="error-message">Error displaying builder details: {renderError.message}</p>
            <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
          </Card>
        </div>
      </div>
    );
  }
};

export default BuilderDetail;
