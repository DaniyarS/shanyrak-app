/**
 * IEstateRepository - Repository Interface (Abstraction)
 */
export class IEstateRepository {
  /**
   * Get all customer estates
   * @returns {Promise<Array<Estate>>}
   */
  async getCustomerEstates() {
    throw new Error('Method not implemented');
  }

  /**
   * Create new estate
   * @param {Estate} estate - Estate entity
   * @returns {Promise<Estate>}
   */
  async create(estate) {
    throw new Error('Method not implemented');
  }

  /**
   * Update existing estate
   * @param {Estate} estate - Estate entity
   * @returns {Promise<Estate>}
   */
  async update(estate) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete estate by ID
   * @param {string} id - Estate ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}
