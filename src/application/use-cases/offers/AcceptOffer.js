/**
 * AcceptOffer Use Case
 * Customer accepts an offer from a builder
 */
export class AcceptOffer {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the accept offer use case
   * @param {string} offerId - Offer ID
   * @param {Object} data - Additional data (startDate, endDate)
   * @returns {Promise<Object>} Result
   */
  async execute(offerId, data = {}) {
    const errors = {};

    if (!offerId) {
      errors.offerId = 'Offer ID is required';
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    try {
      const result = await this.offerRepository.accept(offerId, data);

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('AcceptOffer use case failed:', error);
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to accept offer' },
      };
    }
  }
}
