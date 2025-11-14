/**
 * IOfferRepository - Repository Interface (Abstraction)
 */
export class IOfferRepository {
  /**
   * Create new offer
   * @param {Offer} offer - Offer entity
   * @param {string} orderId - Order ID
   * @returns {Promise<Offer>}
   */
  async create(offer, orderId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get offers by order ID
   * @param {string} orderId - Order ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array<Offer>>}
   */
  async getByOrderId(orderId, filters) {
    throw new Error('Method not implemented');
  }

  /**
   * Get offer by ID
   * @param {string} id - Offer ID
   * @returns {Promise<Offer>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }
}
