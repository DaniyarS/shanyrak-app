/**
 * IOrderRepository - Repository Interface (Abstraction)
 * Follows Interface Segregation Principle and Dependency Inversion Principle
 * Domain layer depends on this abstraction, not on concrete implementations
 */
export class IOrderRepository {
  /**
   * Search orders with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array<Order>>}
   */
  async search(filters) {
    throw new Error('Method not implemented');
  }

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Order>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create new order
   * @param {Order} order - Order entity
   * @param {string} categoryId - Category ID
   * @param {string} estateId - Estate ID
   * @returns {Promise<Order>}
   */
  async create(order, categoryId, estateId) {
    throw new Error('Method not implemented');
  }

  /**
   * Update existing order
   * @param {Order} order - Order entity
   * @returns {Promise<Order>}
   */
  async update(order) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete order by ID
   * @param {string} id - Order ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get customer's own orders with pagination
   * @param {Object} params - Pagination params { page, size, sort }
   * @returns {Promise<Array<Order>>}
   */
  async getCustomerOrders(params) {
    throw new Error('Method not implemented');
  }
}
