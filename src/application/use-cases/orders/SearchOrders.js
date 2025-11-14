/**
 * SearchOrders Use Case
 */
export class SearchOrders {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   */
  async execute(filters = {}) {
    try {
      const orders = await this.orderRepository.search(filters);

      return {
        success: true,
        orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search orders',
        orders: [],
      };
    }
  }
}
