import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { container } from '../infrastructure/di/ServiceContainer';
import './WasteDetail.css';

function WasteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [waste, setWaste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaste();
  }, [id]);

  const loadWaste = async () => {
    try {
      const useCase = container.getGetWasteByIdUseCase();
      const result = await useCase.execute(id);
      if (result.success) {
        setWaste(result.waste);
      }
    } catch (error) {
      console.error('Failed to load waste:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPhone = async () => {
    try {
      const useCase = container.getRequestWastePhoneUseCase();
      const result = await useCase.execute(id);
      if (result.success) {
        alert(`${t.waste.detail.phoneRequested}: ${result.phone}`);
      }
    } catch (error) {
      alert(t.errors.operationFailed);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.waste.detail.deleteConfirm)) return;

    try {
      const useCase = container.getDeleteWasteUseCase();
      const result = await useCase.execute(id);
      if (result.success) {
        alert(t.waste.detail.deleted);
        navigate('/');
      }
    } catch (error) {
      alert(t.errors.operationFailed);
    }
  };

  if (loading) {
    return <div className="waste-detail-loading">{t.common.loading}</div>;
  }

  if (!waste) {
    return <div className="waste-detail-error">Not found</div>;
  }

  const isOwner = user && waste.owner && user.id === waste.owner.id;

  return (
    <div className="waste-detail">
      <button onClick={() => navigate('/')} className="btn-back">
        ← {t.common.back}
      </button>

      <div className="waste-detail-content">
        {waste.photos && waste.photos.length > 0 && (
          <div className="detail-photos">
            <img src={waste.photos[0]} alt={waste.title} />
          </div>
        )}

        <h1>{waste.title}</h1>

        <div className="detail-meta">
          <div className="detail-price">
            {waste.isFree() ? (
              <span className="price-free">{t.waste.free}</span>
            ) : (
              <span className="price-value">{waste.price} ₸</span>
            )}
          </div>
          <div className="detail-amount">
            {waste.amount} {t.waste.units[waste.unit] || waste.unit}
          </div>
        </div>

        <div className="detail-section">
          <h3>{t.orders.description}</h3>
          <p>{waste.description}</p>
        </div>

        <div className="detail-section">
          <h3>{t.orders.location}</h3>
          <p>{waste.city}{waste.district && `, ${waste.district}`}</p>
        </div>

        <div className="detail-section">
          <h3>{t.waste.categories}</h3>
          <div className="detail-category">
            {waste.category?.icon} {waste.category?.getLocalizedName(language)}
          </div>
        </div>

        <div className="detail-actions">
          {isOwner ? (
            <>
              <button onClick={handleDelete} className="btn-delete">
                {t.waste.detail.delete}
              </button>
            </>
          ) : (
            <button onClick={handleRequestPhone} className="btn-contact">
              {t.waste.detail.contactSeller}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WasteDetail;
