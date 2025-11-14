/**
 * GetBuilderReviews Use Case
 * Get all reviews for a specific builder
 */
export class GetBuilderReviews {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  /**
   * Execute the use case
   */
  async execute(builderId, params = {}) {
    if (!builderId) {
      return {
        success: false,
        errors: { builderId: 'Builder ID is required' },
      };
    }

    try {
      const reviews = await this.reviewRepository.getBuilderReviews(builderId, params);

      return {
        success: true,
        reviews,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to get reviews' },
      };
    }
  }
}
