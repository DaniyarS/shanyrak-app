import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import './Modal.css';

const EditOfferModal = ({ offer, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    price: offer.price || '',
    unit: offer.unit || 'fixed',
    daysEstimate: offer.daysEstimate || '',
    message: offer.message || '',
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
      const updateOfferUseCase = container.getUpdateOfferUseCase();
      const result = await updateOfferUseCase.execute(offer.publicId, {
        price: parseFloat(formData.price),
        unit: formData.unit,
        daysEstimate: parseInt(formData.daysEstimate),
        message: formData.message,
      });

      if (result.success) {
        alert(t('offers.offerUpdated'));
        onSuccess();
      } else {
        setErrors(result.errors || {});
        if (result.errors?.submit) {
          alert(result.errors.submit);
        }
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      alert(error.response?.data?.message || 'Failed to update offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('offers.editOffer')}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Show order title for context */}
          {offer.order && (
            <div className="order-context">
              <p className="order-title-small">{offer.order.title}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="price">
                {t('orders.yourPrice')} <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="unit">
                {t('orders.priceUnit')} <span className="required">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className={errors.unit ? 'error' : ''}
              >
                <option value="m2">{t('offers.perM2')}</option>
                <option value="unit">{t('offers.perUnit')}</option>
                <option value="hour">{t('offers.perHour')}</option>
                <option value="day">{t('offers.perDay')}</option>
                <option value="fixed">{t('offers.fixedPrice')}</option>
              </select>
              {errors.unit && <span className="error-message">{errors.unit}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="daysEstimate">
                {t('orders.estimatedDays')} <span className="required">*</span>
              </label>
              <input
                type="number"
                id="daysEstimate"
                name="daysEstimate"
                value={formData.daysEstimate}
                onChange={handleChange}
                min="1"
                placeholder={t('orders.daysPlaceholder')}
                required
                className={errors.daysEstimate ? 'error' : ''}
              />
              {errors.daysEstimate && <span className="error-message">{errors.daysEstimate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                {t('orders.yourMessage')} <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder={t('orders.offerMessagePlaceholder')}
                required
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? t('common.loading') : t('common.update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOfferModal;
