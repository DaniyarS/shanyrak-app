import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './BuilderDetailDialog.css';

const BuilderDetailDialog = ({ builder, onClose }) => {
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="builder-detail-dialog">
        <button className="dialog-close-button" onClick={onClose}>
          ×
        </button>

        <div className="dialog-header">
          <div className="builder-avatar-large">
            {builder.avatarLink ? (
              <>
                {avatarLoading && <div className="builder-avatar-large-shimmer"></div>}
                <img
                  src={builder.avatarLink}
                  alt={builder.getDisplayName()}
                  className={avatarLoading ? 'loading' : 'loaded'}
                  onLoad={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
              </>
            ) : (
              <div className="avatar-placeholder-large">
                {builder.getDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="builder-header-info">
            <div className="builder-name-row-large">
              <h2>{builder.getDisplayName()}</h2>
              <span className={`status-indicator-large ${builder.isAvailable() ? 'online' : 'offline'}`}></span>
            </div>
            <div className="builder-rating-large">
              {renderStars(builder.ratingAvg)}
              <span className="rating-value-large">{builder.getFormattedRating()}</span>
            </div>
          </div>
        </div>

        <div className="dialog-body">
          {/* About Me Section */}
          {builder.aboutMe && (
            <div className="detail-section">
              <h3>{t('services.aboutMe')}</h3>
              <p className="about-text">{builder.aboutMe}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="detail-section">
            <h3>{t('estates.contact')}</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">{t('services.phone')}:</span>
                <span className="detail-value">
                  <a href={`tel:${builder.phone}`}>{builder.phone}</a>
                </span>
              </div>
              {builder.email && (
                <div className="detail-row">
                  <span className="detail-label">{t('estates.email')}:</span>
                  <span className="detail-value">
                    <a href={`mailto:${builder.email}`}>{builder.email}</a>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(builder.city || builder.district) && (
            <div className="detail-section">
              <h3>{t('orders.location')}</h3>
              <div className="detail-grid">
                {builder.city && (
                  <div className="detail-row">
                    <span className="detail-label">{t('services.city')}:</span>
                    <span className="detail-value">{builder.city}</span>
                  </div>
                )}
                {builder.district && (
                  <div className="detail-row">
                    <span className="detail-label">{t('services.district')}:</span>
                    <span className="detail-value">{builder.district}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience & Statistics */}
          <div className="detail-section">
            <h3>{t('services.experienceYears')}</h3>
            <div className="stats-grid">
              {builder.experienceYears > 0 && (
                <div className="stat-card">
                  <div className="stat-value">{builder.experienceYears}</div>
                  <div className="stat-label">{t('services.years')}</div>
                </div>
              )}
              {builder.jobsDone > 0 && (
                <div className="stat-card">
                  <div className="stat-value">{builder.jobsDone}</div>
                  <div className="stat-label">{t('services.jobs')}</div>
                </div>
              )}
              <div className="stat-card">
                <div className="stat-value">{builder.getFormattedRating()}</div>
                <div className="stat-label">{t('services.rating')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="button-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuilderDetailDialog;
