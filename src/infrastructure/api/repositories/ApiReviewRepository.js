import { IReviewRepository } from '../../../domain/repositories/IReviewRepository';
import { ReviewMapper } from '../mappers/ReviewMapper';
import api from '../../../services/api';

/**
 * ApiReviewRepository - Concrete implementation of IReviewRepository
 */
export class ApiReviewRepository extends IReviewRepository {
  /**
   * Create new review
   * POST /api/v1/reviews
   */
  async create(review, contractId) {
    const dto = ReviewMapper.toCreateDTO(review, contractId);
    const response = await api.post('/api/v1/reviews', dto);
    return ReviewMapper.toDomain(response.data);
  }

  /**
   * Get review by ID
   * GET /api/v1/reviews/{reviewPublicId}
   */
  async getById(id) {
    const response = await api.get(`/api/v1/reviews/${id}`);
    return ReviewMapper.toDomain(response.data);
  }

  /**
   * Get reviews for a builder
   * GET /api/v1/reviews/builder/{builderPublicId}
   */
  async getBuilderReviews(builderId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
      queryParams.append('page', params.page);
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size);
    }

    const response = await api.get(`/api/v1/reviews/builder/${builderId}?${queryParams.toString()}`);
    const data = response.data;

    const reviewsList = Array.isArray(data) ? data : (data?.content || []);
    return ReviewMapper.toDomainList(reviewsList);
  }
}
