import { Order } from '../../../domain/entities/Order';

/**
 * UpdateOrder Use Case
 */
export class UpdateOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   */
  async execute(orderId, orderData, categoryId, estateId) {
    // Validate input
    const validation = Order.validate({
      ...orderData,
      category: {},
      realEstate: {},
    });

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      // Create domain entity with ID
      const order = new Order({
        id: orderId,
        ...orderData,
        category: null,
        realEstate: null,
      });

      // Update through repository
      const updatedOrder = await this.orderRepository.update(order, categoryId, estateId);

      return {
        success: true,
        order: updatedOrder,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to update order' },
      };
    }
  }
}
