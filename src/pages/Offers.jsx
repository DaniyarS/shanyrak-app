import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import offerService from '../services/offerService';
import Card from '../components/Card';
import EditOfferModal from '../components/EditOfferModal';
import { OfferStatus } from '../domain/entities/Offer';
import { container } from '../infrastructure/di/ServiceContainer';
import './Offers.css';

const Offers = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchBuilderOffers();
  }, []);

  const fetchBuilderOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offerService.getBuilderOffers();
      // Handle paginated response
      const offersData = response?.content || [];
      setOffers(offersData);
    } catch (error) {
      console.error('Error fetching builder offers:', error);
      setError(error.response?.data?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const getUnitText = (unit) => {
    const units = {
      m2: t('offers.perM2'),
      perM2: t('offers.perM2'),
      unit: t('offers.perUnit'),
      perUnit: t('offers.perUnit'),
      hour: t('offers.perHour'),
      perHour: t('offers.perHour'),
      day: t('offers.perDay'),
      perDay: t('offers.perDay'),
      fixed: t('offers.fixedPrice'),
    };
    return units[unit] || units[unit?.toLowerCase()] || unit;
  };

  const getOfferStatusBadge = (status) => {
    const statusMap = {
      [OfferStatus.PENDING]: { className: 'pending', label: t('offers.statusPending') },
      [OfferStatus.ACCEPTED]: { className: 'accepted', label: t('offers.statusAccepted') },
      [OfferStatus.REJECTED]: { className: 'rejected', label: t('offers.statusRejected') },
      [OfferStatus.WITHDRAWN]: { className: 'withdrawn', label: t('offers.statusWithdrawn') },
      'NEW': { className: 'pending', label: t('offers.statusPending') }, // Legacy support
    };

    const statusConfig = statusMap[status] || statusMap[OfferStatus.PENDING];
    return <span className={`status-badge ${statusConfig.className}`}>{statusConfig.label}</span>;
  };

  const handleEditOffer = (offer, order) => {
    setEditingOffer({ ...offer, order });
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!window.confirm(t('offers.withdrawConfirm'))) {
      return;
    }

    setWithdrawing(true);
    try {
      const withdrawOfferUseCase = container.getWithdrawOfferUseCase();
      const result = await withdrawOfferUseCase.execute(offerId);

      if (result.success) {
        alert(t('offers.offerWithdrawn'));
        fetchBuilderOffers(); // Refresh the list
      } else {
        alert(result.errors?.submit || t('common.error'));
      }
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      alert(error.response?.data?.message || 'Failed to withdraw offer');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleOfferUpdated = () => {
    setEditingOffer(null);
    fetchBuilderOffers(); // Refresh the list
  };

  const canEditOffer = (status) => {
    return status === OfferStatus.PENDING || status === 'NEW';
  };

  if (loading) {
    return (
      <div className="offers-page">
        <div className="container">
          <p className="loading-message">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <div className="container">
        <div className="offers-header">
          <h1>{t('navbar.myOffers')}</h1>
          <p>{t('offers.myOffersSubtitle')}</p>
        </div>

        {error && (
          <Card className="error-card">
            <p className="error-message">{error}</p>
          </Card>
        )}

        {offers.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <h3>{t('offers.noOffersYet')}</h3>
              <p>{t('offers.noOffersDescription')}</p>
            </div>
          </Card>
        ) : (
          <div className="offers-grid">
            {offers.map((item) => (
              <Card key={item.offer?.publicId} className="offer-card">
                {/* Offer Status */}
                <div className="offer-card-header">
                  <h3 className="offer-order-title">
                    {item.order?.title ||
                     (item.category?.name && item.realEstate?.city
                       ? `${item.category.name} · ${item.realEstate.city}`
                       : item.category?.name || t('orders.order'))}
                  </h3>
                  {getOfferStatusBadge(item.offer?.status)}
                </div>

                {/* Order Details */}
                {item.order && (
                  <div className="offer-order-details">
                    <p className="order-description">{item.order.description}</p>

                    <div className="order-info">
                      {item.category && (
                        <p className="info-item">
                          <strong className="info-label">{t('orders.category')}:</strong> {item.category.name}
                        </p>
                      )}

                      {item.realEstate && (
                        <>
                          <p className="info-item">
                            <strong className="info-label">{t('orders.location')}:</strong> {item.realEstate.city}, {item.realEstate.district}
                          </p>
                          <p className="info-item">
                            <strong className="info-label">{t('orders.area')}:</strong> {item.realEstate.areaM2} m²
                          </p>
                        </>
                      )}

                      {item.order.budgetMin && (
                        <p className="info-item">
                          <strong className="info-label">{t('orders.budget')}:</strong> {item.order.budgetMin}
                            {item.order.budgetMax ? `-${item.order.budgetMax}` : '+'} ₸
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Offer Details */}
                <div className="offer-details-section">
                  <h4>{t('offers.yourOffer')}</h4>

                  <div className="offer-pricing">
                    <p className="offer-price-item">
                      <strong className="offer-price-label">{t('orders.yourPrice')}:</strong> {item.offer?.price} ₸ {getUnitText(item.offer?.unit)}
                    </p>
                    <p className="offer-price-item">
                      <strong className="offer-price-label">{t('offers.estimatedDays')}:</strong> {item.offer?.daysEstimate} {item.offer?.daysEstimate === 1 ? t('offers.day') : t('offers.days')}
                    </p>
                  </div>

                  {item.offer?.message && (
                    <>
                      <h4>{t('orders.yourMessage')}</h4>
                      <div className="offer-message-box">
                        {item.offer?.createdAt && (
                          <p className="message-date">
                            {new Date(item.offer.createdAt).toLocaleDateString()}
                          </p>
                        )}
                        <p className="message-text">{item.offer.message}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Offer Actions */}
                {canEditOffer(item.offer?.status) && (
                  <div className="offer-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditOffer(item.offer, item.order)}
                    >
                      {t('offers.editOffer')}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleWithdrawOffer(item.offer?.publicId)}
                      disabled={withdrawing}
                    >
                      {withdrawing ? t('common.loading') : t('offers.withdrawOffer')}
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Offer Modal */}
      {editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSuccess={handleOfferUpdated}
        />
      )}
    </div>
  );
};

export default Offers;
