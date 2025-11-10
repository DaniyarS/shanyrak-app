import { useLanguage } from '../../context/LanguageContext';
import './BuilderCard.css';

const BuilderCard = ({ builder, onClick }) => {
  const { t } = useLanguage();

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
        <div className="builder-avatar">
          {builder.avatarLink ? (
            <img src={builder.avatarLink} alt={builder.getDisplayName()} />
          ) : (
            <div className="avatar-placeholder">
              {builder.getDisplayName().charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="builder-info">
          <div className="builder-name-row">
            <h3 className="builder-name">{builder.getDisplayName()}</h3>
            <span className={`status-indicator ${builder.isAvailable() ? 'online' : 'offline'}`}></span>
          </div>
          <div className="builder-rating">
            {renderStars(builder.ratingAvg)}
            <span className="rating-value">{builder.getFormattedRating()}</span>
          </div>
        </div>
      </div>

      <div className="builder-card-body">
        {builder.aboutMe && (
          <p className="builder-about">{builder.aboutMe}</p>
        )}

        <div className="builder-details">
          <div className="detail-item">
            <span className="detail-label">{t('services.phone')}:</span>
            <span className="detail-value">{builder.phone}</span>
          </div>

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
      </div>
    </div>
  );
};

export default BuilderCard;
