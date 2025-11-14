import { Order } from '../../../domain/entities/Order';

/**
 * CreateOrder Use Case
 * Follows Single Responsibility Principle - only handles order creation
 */
export class CreateOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {Object} orderData - Order data from UI
   * @param {string} categoryId - Category ID
   * @param {string} estateId - Estate ID
   * @returns {Promise<{success: boolean, order?: Order, errors?: Object}>}
   */
  async execute(orderData, categoryId, estateId) {
    // Validate input
    const validation = Order.validate({
      ...orderData,
      category: categoryId ? {} : null,
      realEstate: estateId ? {} : null,
    });

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      // Create domain entity
      const order = new Order({
        ...orderData,
        id: null, // Will be set by backend
        category: null,
        realEstate: null,
      });

      // Persist through repository
      const createdOrder = await this.orderRepository.create(order, categoryId, estateId);

      return {
        success: true,
        order: createdOrder,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to create order' },
      };
    }
  }
}
