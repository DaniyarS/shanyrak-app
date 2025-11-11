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
    fetchBuilderDetails();
  }, [builderId]);

  const fetchBuilderDetails = async () => {
    try {
      setLoading(true);
      const getBuilderUseCase = container.getGetBuilderUseCase();
      const result = await getBuilderUseCase.execute(builderId);

      if (result.success) {
        setBuilder(result.builder);
      } else {
        setError(result.error || 'Failed to load builder details');
      }
    } catch (error) {
      console.error('Error fetching builder details:', error);
      setError('Failed to load builder details');
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

  return (
    <div className="builder-detail-page">
      <div className="container">
        <div className="builder-detail-header">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← {t('common.back')}
          </Button>
          <h1>{t('services.builderDetails')}</h1>
        </div>

        <div className="builder-detail-content">
          {/* Main Info Card */}
          <Card className="builder-main-card">
            <div className="builder-header-section">
              <div className="builder-avatar">
                {builder.avatarLink ? (
                  <img src={builder.avatarLink} alt={builder.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {(builder.fullName || builder.login || 'B').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="builder-header-info">
                <div className="builder-name-status">
                  <h2>{builder.fullName || builder.login}</h2>
                  <span className={`status-indicator ${builder.available ? 'online' : 'offline'}`}></span>
                  <span className="status-text">
                    {builder.available ? t('services.available') : t('services.notAvailable')}
                  </span>
                </div>
                <div className="builder-rating-section">
                  <span className="rating-stars">⭐ {builder.ratingAvg?.toFixed(1) || '0.0'}</span>
                  <span className="rating-label">{t('services.rating')}</span>
                </div>
              </div>
            </div>

            <div className="builder-contact-section">
              <a href={`tel:${builder.phone}`} className="contact-button phone">
                📞 {builder.phone}
              </a>
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
              <h3>{t('services.aboutMe')}</h3>
              <p className="about-text">{builder.aboutMe}</p>
            </Card>
          )}

          {/* Professional Info */}
          <Card className="builder-section-card">
            <h3>{t('profile.professionalInfo')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('services.experienceYears')}:</span>
                <span className="info-value">{builder.experienceYears || 0} {t('services.years')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('services.jobsDone')}:</span>
                <span className="info-value">{builder.jobsDone || 0} {t('services.jobs')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('services.city')}:</span>
                <span className="info-value">{builder.city || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('services.district')}:</span>
                <span className="info-value">{builder.district || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Price List */}
          {builder.priceList && builder.priceList.length > 0 && (
            <Card className="builder-section-card">
              <h3>Price List</h3>
              <div className="price-list">
                {builder.priceList.map((item, index) => (
                  <div key={index} className="price-item">
                    <span className="price-category">{item.category}</span>
                    <span className="price-amount">{item.price} ₸</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderDetail;
