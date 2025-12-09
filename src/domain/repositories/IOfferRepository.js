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

  /**
   * Update existing offer (builder can edit if status is PENDING)
   * @param {string} offerId - Offer ID
   * @param {Offer} offer - Updated offer data
   * @returns {Promise<Offer>}
   */
  async update(offerId, offer) {
    throw new Error('Method not implemented');
  }

  /**
   * Withdraw offer (sets status to WITHDRAWN)
   * @param {string} offerId - Offer ID
   * @returns {Promise<void>}
   */
  async withdraw(offerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get builder information by offer ID
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Builder information
   */
  async getBuilderByOfferId(offerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Accept offer (customer accepts the offer)
   * @param {string} offerId - Offer ID
   * @param {Object} data - Additional data (startDate, endDate)
   * @returns {Promise<Object>}
   */
  async accept(offerId, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Reject offer (customer rejects the offer)
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>}
   */
  async reject(offerId) {
    throw new Error('Method not implemented');
  }
}
