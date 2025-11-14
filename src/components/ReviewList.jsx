import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Card from './Card';
import './ReviewList.css';

const ReviewList = ({ builderId }) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (builderId) {
      fetchReviews();
    }
  }, [builderId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const getBuilderReviewsUseCase = container.getBuilderReviewsUseCase();
      const result = await getBuilderReviewsUseCase.execute(builderId, { page: 0, size: 20 });

      if (result.success) {
        setReviews(result.reviews || []);
      } else {
        setError(result.errors?.submit || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (loading) {
    return (
      <div className="review-list">
        <h3>{t('reviews.builderReviews')}</h3>
        <p className="loading-message">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-list">
        <h3>{t('reviews.builderReviews')}</h3>
        <Card className="error-card">
          <p className="error-message">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="review-list">
      <h3>{t('reviews.builderReviews')}</h3>

      {reviews.length === 0 ? (
        <Card className="empty-reviews">
          <div className="empty-icon">📝</div>
          <p>{t('reviews.noReviews')}</p>
          <p className="empty-description">{t('reviews.noReviewsDescription')}</p>
        </Card>
      ) : (
        <div className="reviews-container">
          {reviews.map((review) => (
            <Card key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-rating">
                  <span className="stars">{renderStars(review.rating)}</span>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
                {review.createdAt && (
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="review-body">
                <p className="review-message">{review.message}</p>
              </div>

              {review.reviewerName && (
                <div className="review-footer">
                  <span className="reviewer-name">
                    {t('reviews.reviewBy')}: {review.reviewerName}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
