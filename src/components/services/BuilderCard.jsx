import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { container } from '../../infrastructure/di/ServiceContainer';
import './BuilderCard.css';

const BuilderCard = ({ builder, onClick, avatarUrl }) => {
  const { t } = useLanguage();
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    // Load portfolio photos for this builder
    const fetchPortfolioPhotos = async () => {
      if (!builder.id) return;

      try {
        setLoadingPhotos(true);
        const getPortfolioUseCase = container.getGetPortfolioPhotosUseCase();
        const result = await getPortfolioUseCase.execute(builder.id);

        if (result.success && result.files) {
          // Show only first 3 photos in card
          setPortfolioPhotos(result.files.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching portfolio photos:', error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchPortfolioPhotos();
  }, [builder.id]);

  const renderStarRating = (rating) => {
    // Calculate fill percentage (rating is 0-5, convert to 0-100%)
    const fillPercentage = Math.min(100, (rating / 5) * 100);

    return (
      <div className="single-star-rating">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="star-svg"
        >
          {/* Define gradient for partial fill */}
          <defs>
            <linearGradient id={`star-gradient-${builder.id}`}>
              <stop offset={`${fillPercentage}%`} stopColor="var(--color-warning)" />
              <stop offset={`${fillPercentage}%`} stopColor="var(--color-neutral-300)" />
            </linearGradient>
          </defs>
          {/* Star path */}
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={`url(#star-gradient-${builder.id})`}
            stroke="var(--color-warning)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="builder-card" onClick={onClick}>
      <div className="builder-card-header">
        <div className={`builder-avatar-wrapper ${builder.isRecommended() ? 'recommended' : ''}`}>
          <div className="builder-avatar">
            {avatarUrl ? (
              <>
                {avatarLoading && <div className="builder-avatar-shimmer"></div>}
                <img
                  src={avatarUrl}
                  alt={builder.getDisplayName()}
                  className={avatarLoading ? 'loading' : 'loaded'}
                  onLoad={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
              </>
            ) : (
              <div className="avatar-placeholder">
                {builder.getDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {builder.isRecommended() && (
            <div className="recommended-badge" title={t('builders.recommended')}>
              👍
            </div>
          )}
        </div>
        <div className="builder-info">
          <div className="builder-name-row">
            <h3 className="builder-name">{builder.getDisplayName()}</h3>
            {builder.isVerified() && (
              <div className="verified-badge" title={t('builders.verified')}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="builder-rating">
            {renderStarRating(builder.ratingAvg)}
            <span className="rating-value">{builder.getFormattedRating()}</span>
            {builder.isAvailable() && (
              <span className="availability-badge available" title={t('builders.available')}>
                <span className="availability-dot"></span>
                {t('builders.available')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="builder-card-body">
        <p className="builder-about">
          {builder.aboutMe || 'Builder did not add description yet'}
        </p>

        <div className="builder-details">
          {builder.city && (
            <div className="detail-item">
              <span className="detail-label">{t('services.city')}:</span>
              <span className="detail-value">{builder.city}</span>
            </div>
          )}

          {builder.experienceYears > 0 && (
            <div className="detail-item">
              <span className="detail-label">{t('services.experienceYears')}:</span>
              <span className="detail-value">
                {builder.experienceYears} {t('services.years')}
              </span>
            </div>
          )}

          {builder.jobsDone > 0 && (
            <div className="detail-item">
              <span className="detail-label">{t('services.jobsDone')}:</span>
              <span className="detail-value">
                {builder.jobsDone} {t('services.jobs')}
              </span>
            </div>
          )}
        </div>

        {/* Category and Price Badges */}
        {builder.priceList && builder.priceList.length > 0 && (
          <div className="builder-services">
            <div className="services-badges">
              {builder.priceList.slice(0, 3).map((service, index) => (
                <span key={index} className="category-badge">
                  {service.category?.icon} {service.category?.name}
                  <span className="price-text">от {service.price} ₸</span>
                </span>
              ))}
              {builder.priceList.length > 3 && (
                <div className="more-services">
                  +{builder.priceList.length - 3} услуг
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Photos */}
        {portfolioPhotos.length > 0 && (
          <div className="builder-portfolio-preview">
            <div className="portfolio-preview-label">{t('profile.portfolio')}</div>
            <div className="portfolio-preview-grid">
              {portfolioPhotos.map((photo, index) => (
                <div key={photo.id || index} className="portfolio-preview-item">
                  <img
                    src={photo.url}
                    alt={`Portfolio ${index + 1}`}
                    className="portfolio-preview-image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderCard;
