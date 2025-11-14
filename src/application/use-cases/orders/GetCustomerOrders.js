/**
 * GetCustomerOrders Use Case
 * Retrieves orders belonging to the authenticated customer
 */
export class GetCustomerOrders {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {Object} params - Pagination params { page, size, sort }
   */
  async execute(params = { page: 0, size: 10, sort: 'createAt,desc' }) {
    try {
      const orders = await this.orderRepository.getCustomerOrders(params);

      return {
        success: true,
        orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get customer orders',
        orders: [],
      };
    }
  }
}
