/**
 * IReviewRepository - Repository Interface (Abstraction)
 * Follows Interface Segregation Principle and Dependency Inversion Principle
 * Domain layer depends on this abstraction, not on concrete implementations
 */
export class IReviewRepository {
  /**
   * Create new review
   * @param {Review} review - Review entity
   * @param {string} contractId - Contract ID
   * @returns {Promise<Review>}
   */
  async create(review, contractId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get review by ID
   * @param {string} id - Review ID
   * @returns {Promise<Review>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get reviews for a builder
   * @param {string} builderId - Builder ID
   * @param {Object} params - Pagination params { page, size }
   * @returns {Promise<Array<Review>>}
   */
  async getBuilderReviews(builderId, params) {
    throw new Error('Method not implemented');
  }
}
