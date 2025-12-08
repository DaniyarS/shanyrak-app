import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './BuilderCard.css';

const BuilderCard = ({ builder, onClick, avatarUrl }) => {
  const { t } = useLanguage();
  const [avatarLoading, setAvatarLoading] = useState(true);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="star filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }

    return stars;
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          <div className="builder-rating">
            {renderStars(builder.ratingAvg)}
            <span className="rating-value">{builder.getFormattedRating()}</span>
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
      </div>
    </div>
  );
};

export default BuilderCard;
