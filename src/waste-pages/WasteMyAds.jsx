import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import WasteCreate from './WasteCreate';
import './WasteMyAds.css';

function WasteMyAds() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadMyAds();
  }, []);

  const loadMyAds = async () => {
    try {
      const useCase = container.getGetMyWasteUseCase();
      const result = await useCase.execute();
      if (result.success) {
        setMyAds(result.content);
      }
    } catch (error) {
      console.error('Failed to load my ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadMyAds();
  };

  return (
    <div className="waste-my-ads-page">
      <section className="my-ads-section">
        <div className="container">
          <div className="my-ads-header">
            <h2>{t.waste.myAds}</h2>
            <Button variant="primary" onClick={handleCreateClick}>
              + {t.waste.createAd}
            </Button>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>{t.common.loading}</p>
            </div>
          ) : myAds.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">📦</div>
                <h3>{t.waste.noAds}</h3>
                <p>{t.waste.noAdsDescription}</p>
                <Button variant="primary" onClick={handleCreateClick}>
                  {t.waste.createAd}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="my-ads-grid">
              {myAds.map(ad => (
                <Card
                  key={ad.id}
                  className="my-ad-card"
                  onClick={() => navigate(`/waste/${ad.id}`)}
                >
                  {ad.photos && ad.photos.length > 0 && (
                    <div className="ad-image-container">
                      <img src={ad.photos[0]} alt={ad.title} className="ad-image" />
                      <span className={`status-badge ${ad.status.toLowerCase()}`}>
                        {ad.isSold() ? t.waste.sold : t.waste.available}
                      </span>
                    </div>
                  )}
                  <div className="ad-content">
                    <div className="ad-header">
                      <h3 className="ad-title">{ad.title}</h3>
                      <span className={`ad-price-badge ${ad.isFree() ? 'free' : 'paid'}`}>
                        {ad.isFree() ? t.waste.free : `${ad.price} ₸`}
                      </span>
                    </div>
                    <p className="ad-description">{ad.description}</p>
                    <div className="ad-meta">
                      <span className="ad-meta-item">
                        📦 {ad.amount} {t.waste.units[ad.unit] || ad.unit}
                      </span>
                      <span className="ad-meta-item">
                        📍 {ad.city}
                      </span>
                      {ad.category && (
                        <span className="ad-category-tag">
                          {ad.category.icon} {ad.category.getLocalizedName(language)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <WasteCreate onClose={handleCloseModal} onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteMyAds;
