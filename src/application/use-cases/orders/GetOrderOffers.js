/**
 * GetOrderOffers Use Case
 * Retrieves all offers for a specific order
 */
export class GetOrderOffers {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the use case
   */
  async execute(orderId, filters = {}) {
    if (!orderId) {
      return {
        success: false,
        error: 'Order ID is required',
        offers: [],
      };
    }

    try {
      const offers = await this.offerRepository.getByOrderId(orderId, filters);

      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get offers',
        offers: [],
      };
    }
  }
}
