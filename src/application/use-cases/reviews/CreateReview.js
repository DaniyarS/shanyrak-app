import { Review } from '../../../domain/entities/Review';

/**
 * CreateReview Use Case
 * Both customer and builder can leave reviews after contract completion
 * Customer reviews builder, builder reviews customer
 */
export class CreateReview {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  /**
   * Execute the use case
   */
  async execute(reviewData, contractId) {
    const validation = Review.validate({ ...reviewData, contractId });

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const review = new Review({
        id: null,
        ...reviewData,
        contractId,
      });

      const createdReview = await this.reviewRepository.create(review, contractId);

      return {
        success: true,
        review: createdReview,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to create review' },
      };
    }
  }
}
