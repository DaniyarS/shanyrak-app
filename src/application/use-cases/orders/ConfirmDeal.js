/**
 * ConfirmDeal Use Case
 * Customer confirms or rejects the deal with builder
 * If agreed=true: creates contract, offer becomes ACCEPTED, others become REJECTED
 * If agreed=false: offer becomes REJECTED, order returns to OPEN
 */
export class ConfirmDeal {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   */
  async execute(orderId, dealData) {
    const errors = {};

    if (!orderId) {
      errors.orderId = 'Order ID is required';
    }

    if (!dealData.offerPublicId) {
      errors.offerPublicId = 'Offer ID is required';
    }

    if (dealData.agreed === undefined || dealData.agreed === null) {
      errors.agreed = 'Agreement status is required';
    }

    if (dealData.agreed && !dealData.startDate) {
      errors.startDate = 'Start date is required when confirming deal';
    }

    if (dealData.agreed && !dealData.endDate) {
      errors.endDate = 'End date is required when confirming deal';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    try {
      const result = await this.orderRepository.confirmDeal(orderId, dealData);

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to confirm deal' },
      };
    }
  }
}
