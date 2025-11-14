import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import './Modal.css';

const ReviewForm = ({ contractId, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    rating: 5,
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
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
      const createReviewUseCase = container.getCreateReviewUseCase();
      const result = await createReviewUseCase.execute(
        {
          rating: formData.rating,
          message: formData.message,
        },
        contractId
      );

      if (result.success) {
        alert(t('reviews.reviewSubmitted'));
        onSuccess();
      } else {
        setErrors(result.errors || {});
        if (result.errors?.submit) {
          alert(result.errors.submit);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('reviews.writeReview')}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rating">
                {t('reviews.yourRating')} <span className="required">*</span>
              </label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} className="star-label">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={formData.rating === star}
                      onChange={handleChange}
                      className="star-input"
                    />
                    <span className={`star ${formData.rating >= star ? 'filled' : ''}`}>
                      ⭐
                    </span>
                  </label>
                ))}
              </div>
              <p className="rating-text">
                {formData.rating} {t('reviews.stars')}
              </p>
              {errors.rating && <span className="error-message">{errors.rating}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                {t('reviews.reviewMessage')} <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder={t('reviews.reviewPlaceholder')}
                required
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
              <p className="character-count">{formData.message.length} characters</p>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? t('common.loading') : t('reviews.submitReview')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
