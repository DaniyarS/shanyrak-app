import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import './Modal.css';

const ConfirmDealModal = ({ offer, order, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [isConfirming, setIsConfirming] = useState(true); // true for confirm, false for reject
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      let result;

      if (isConfirming) {
        // Use AcceptOffer use case
        const acceptOfferUseCase = container.getAcceptOfferUseCase();
        const acceptData = {
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        result = await acceptOfferUseCase.execute(offer.id, acceptData);
      } else {
        // Use RejectOffer use case
        const rejectOfferUseCase = container.getRejectOfferUseCase();
        result = await rejectOfferUseCase.execute(offer.id);
      }

      if (result.success) {
        alert(isConfirming ? t('orders.dealConfirmed') : t('orders.dealRejected'));
        onSuccess();
      } else {
        setErrors(result.errors || {});
        if (result.errors?.submit) {
          alert(result.errors.submit);
        }
      }
    } catch (error) {
      console.error('Error processing deal:', error);
      alert(error.response?.data?.message || 'Failed to process deal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isConfirming ? t('orders.confirmDeal') : t('orders.rejectDeal')}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Show order and offer details */}
          <div className="deal-context">
            <h3>{order.title}</h3>
            <div className="deal-offer-info">
              <p><strong>{t('orders.yourPrice')}:</strong> {offer.price} ₸</p>
              <p><strong>{t('offers.estimatedDays')}:</strong> {offer.daysEstimate} {t('offers.days')}</p>
              {offer.builder && (
                <p><strong>{t('services.builders')}:</strong> {offer.builder.fullName || offer.builder.login}</p>
              )}
            </div>
          </div>

          {/* Action Selection */}
          <div className="action-selection">
            <label className="action-option">
              <input
                type="radio"
                name="action"
                checked={isConfirming}
                onChange={() => setIsConfirming(true)}
              />
              <span>{t('orders.confirmDeal')}</span>
            </label>
            <label className="action-option">
              <input
                type="radio"
                name="action"
                checked={!isConfirming}
                onChange={() => setIsConfirming(false)}
              />
              <span>{t('orders.rejectDeal')}</span>
            </label>
          </div>

          {/* Date fields only shown when confirming */}
          {isConfirming && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="startDate">
                  {t('offers.startDate')} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={errors.startDate ? 'error' : ''}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  {t('offers.endDate')} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? t('common.loading') : t('orders.confirmDeal')}
                </button>
              </div>
            </form>
          )}

          {/* Reject confirmation */}
          {!isConfirming && (
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? t('common.loading') : t('orders.rejectDeal')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDealModal;
