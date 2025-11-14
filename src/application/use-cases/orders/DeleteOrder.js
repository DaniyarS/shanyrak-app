/**
 * DeleteOrder Use Case
 */
export class DeleteOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   */
  async execute(orderId) {
    if (!orderId) {
      return {
        success: false,
        error: 'Order ID is required',
      };
    }

    try {
      await this.orderRepository.delete(orderId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete order',
      };
    }
  }
}
