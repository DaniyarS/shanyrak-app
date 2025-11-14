/**
 * RequestBuilderPhone Use Case
 * Customer requests builder's phone number
 * Order status changes to IN_PROGRESS
 */
export class RequestBuilderPhone {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   */
  async execute(orderId, offerId) {
    if (!orderId || !offerId) {
      return {
        success: false,
        errors: {
          orderId: !orderId ? 'Order ID is required' : undefined,
          offerId: !offerId ? 'Offer ID is required' : undefined,
        },
      };
    }

    try {
      const builderContact = await this.orderRepository.requestBuilderPhone(orderId, offerId);

      return {
        success: true,
        builderContact,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to request builder phone' },
      };
    }
  }
}
