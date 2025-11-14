/**
 * GetReview Use Case
 * Get a specific review by ID
 */
export class GetReview {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  /**
   * Execute the use case
   */
  async execute(reviewId) {
    if (!reviewId) {
      return {
        success: false,
        errors: { reviewId: 'Review ID is required' },
      };
    }

    try {
      const review = await this.reviewRepository.getById(reviewId);

      return {
        success: true,
        review,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to get review' },
      };
    }
  }
}
