import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from './Button';
import './BuilderProfileDialog.css';

const BuilderProfileDialog = ({ isOpen, onClose, builderId }) => {
  const { t } = useLanguage();
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    if (isOpen && builderId) {
      fetchBuilderDetails();
      // Reset contact state when opening with new builder
      setShowContacts(false);
      setContactInfo(null);
    }
  }, [isOpen, builderId]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchBuilderDetails = async () => {
    try {
      setLoading(true);
      const getBuilderUseCase = container.getGetBuilderUseCase();
      const result = await getBuilderUseCase.execute(builderId);

      if (result.success) {
        setBuilder(result.builder);
        
        // Fetch portfolio photos
        if (result.builder?.id) {
          fetchPortfolioPhotos(result.builder.id);
        }
      }
    } catch (error) {
      console.error('Error fetching builder details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioPhotos = async (builderProfileId) => {
    try {
      const getPortfolioUseCase = container.getGetPortfolioPhotosUseCase();
      const result = await getPortfolioUseCase.execute(builderProfileId);

      if (result.success) {
        setPortfolioPhotos(result.files || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
    }
  };

  const fetchContactInfo = async () => {
    try {
      setContactsLoading(true);
      const getBuilderUseCase = container.getGetBuilderUseCase();
      const result = await getBuilderUseCase.execute(builderId);

      if (result.success) {
        setContactInfo({
          phone: result.builder?.phone,
          email: result.builder?.email
        });
        setShowContacts(true);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePortfolioImageClick = (image) => {
    setSelectedPortfolioImage(image);
  };

  const closePortfolioImage = () => {
    setSelectedPortfolioImage(null);
  };

  const getPortfolioImageUrl = (photo) => {
    const baseUrl = 'https://api.shanyrak.group';
    return `${baseUrl}/api/v1/files?linkType=BUILDER_PORTFOLIO&linkPublicId=${photo.id || photo.publicId}`;
  };

  const getBuilderAvatarUrl = (builderId) => {
    const baseUrl = 'https://api.shanyrak.group';
    return `${baseUrl}/api/v1/files?linkType=USER_AVATAR&linkPublicId=${builderId}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="builder-dialog-overlay" onClick={handleOverlayClick}>
        <div className="builder-dialog-container">
          {/* Header */}
          <div className="builder-dialog-header">
            <h2>{t('builders.builderProfile')}</h2>
            <button 
              className="dialog-close-button"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="builder-dialog-content">
            {loading ? (
              <div className="dialog-loading">
                <div className="loading-spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : builder ? (
              <>
                {/* Builder Header */}
                <div className="builder-header">
                  <div className="builder-avatar-large">
                    {builder.id ? (
                      <img 
                        src={getBuilderAvatarUrl(builder.id)} 
                        alt={builder.fullName}
                        className="avatar-image-large"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-placeholder-large" style={{ display: builder.id ? 'none' : 'flex' }}>
                      {(builder.fullName || builder.firstName || 'B').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="builder-header-info">
                    <h3 className="builder-name-large">
                      {builder.fullName || [builder.firstName, builder.lastName].filter(Boolean).join(' ') || 'Builder'}
                    </h3>
                    
                    <div className="builder-meta">
                      <div className="builder-rating-large">
                        <span className="rating-stars">⭐</span>
                        <span className="rating-value">
                          {builder.ratingAvg ? builder.ratingAvg.toFixed(1) : '0.0'}
                        </span>
                        <span className="rating-label">({t('services.rating')})</span>
                      </div>

                      {(builder.city || builder.district) && (
                        <div className="builder-location-large">
                          <span className="location-icon">📍</span>
                          <span>{[builder.city, builder.district].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="builder-stats">
                      <div className="stat-item">
                        <span className="stat-value">{builder.experienceYears || 0}</span>
                        <span className="stat-label">{t('services.years')} {t('services.experienceYears')}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{builder.jobsDone || 0}</span>
                        <span className="stat-label">{t('profile.completedProjects')}</span>
                      </div>
                    </div>

                    <div className="builder-status-large">
                      <span className={`status-badge-large ${builder.available ? 'available' : 'unavailable'}`}>
                        {builder.available ? t('services.available') : t('services.notAvailable')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info - Shows after button click */}
                {showContacts && contactInfo && (
                  <div className="builder-section">
                    <h4>{t('builders.contactInfo')}</h4>
                    <div className="contact-info">
                      {contactInfo.phone && (
                        <div className="contact-item">
                          <span className="contact-icon">📞</span>
                          <span className="contact-label">{t('services.phone')}:</span>
                          <span className="contact-value">{contactInfo.phone}</span>
                        </div>
                      )}
                      {contactInfo.email && (
                        <div className="contact-item">
                          <span className="contact-icon">✉️</span>
                          <span className="contact-label">Email:</span>
                          <span className="contact-value">{contactInfo.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* About */}
                {builder.aboutMe && (
                  <div className="builder-section">
                    <h4>{t('services.aboutMe')}</h4>
                    <p className="about-text">{builder.aboutMe}</p>
                  </div>
                )}

                {/* Services */}
                {builder.priceList && builder.priceList.length > 0 && (
                  <div className="builder-section">
                    <h4>{t('builders.services')}</h4>
                    <div className="services-grid">
                      {builder.priceList.map((service, index) => (
                        <div key={index} className="service-item">
                          <h5>{service.category?.name || 'Service'}</h5>
                          <p className="service-price">{service.price} ₸</p>
                          {service.description && (
                            <p className="service-description">{service.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {portfolioPhotos.length > 0 && (
                  <div className="builder-section">
                    <h4>{t('profile.portfolio')}</h4>
                    <div className="portfolio-grid">
                      {portfolioPhotos.map((photo, index) => (
                        <div 
                          key={photo.id || index} 
                          className="portfolio-item"
                          onClick={() => handlePortfolioImageClick(photo)}
                        >
                          <img
                            src={getPortfolioImageUrl(photo)}
                            alt={`Portfolio ${index + 1}`}
                            className="portfolio-image"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="dialog-error">
                <p>{t('builders.builderNotFound')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {builder && (
            <div className="builder-dialog-footer">
              <Button variant="ghost" onClick={onClose}>
                {t('common.close')}
              </Button>
              <Button 
                variant="primary" 
                onClick={fetchContactInfo}
                disabled={contactsLoading || showContacts}
              >
                {contactsLoading ? t('common.loading') : showContacts ? t('builders.contactsShown') : t('builders.contactBuilder')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Image Modal */}
      {selectedPortfolioImage && (
        <div className="portfolio-modal-overlay" onClick={closePortfolioImage}>
          <div className="portfolio-modal-content">
            <button 
              className="portfolio-close-button"
              onClick={closePortfolioImage}
              aria-label={t('common.close')}
            >
              ✕
            </button>
            <img
              src={getPortfolioImageUrl(selectedPortfolioImage)}
              alt="Portfolio"
              className="portfolio-modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BuilderProfileDialog;