/**
 * IBuilderRepository - Repository Interface
 * Defines the contract for Builder data access
 * Follows Dependency Inversion Principle
 */
export class IBuilderRepository {
  /**
   * Search builders with filters
   * @param {Object} filters - Search filters
   * @param {string} filters.categoryPublicId - Category ID to filter by
   * @param {string} filters.city - City to filter by
   * @param {number} filters.ratingFrom - Minimum rating
   * @param {number} filters.priceFrom - Minimum price
   * @param {number} filters.priceTo - Maximum price
   * @param {boolean} filters.availability - Availability status
   * @param {string} filters.q - Search query
   * @param {number} filters.page - Page number
   * @param {number} filters.size - Page size
   * @param {string} filters.sort - Sort order
   * @returns {Promise<Builder[]>}
   */
  async search(filters) {
    throw new Error('Method search() must be implemented');
  }

  /**
   * Get builder by ID
   * @param {string} id - Builder ID
   * @returns {Promise<Builder>}
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Get current builder (me)
   * @returns {Promise<Builder>}
   */
  async getMe() {
    throw new Error('Method getMe() must be implemented');
  }

  /**
   * Update builder
   * @param {string} id - Builder ID
   * @param {Object} data - Builder data to update
   * @returns {Promise<Builder>}
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }
}
