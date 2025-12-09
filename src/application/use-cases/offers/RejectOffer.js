/**
 * RejectOffer Use Case
 * Customer rejects an offer from a builder
 */
export class RejectOffer {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the reject offer use case
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Result
   */
  async execute(offerId) {
    if (!offerId) {
      return {
        success: false,
        errors: { offerId: 'Offer ID is required' },
      };
    }

    try {
      const result = await this.offerRepository.reject(offerId);

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('RejectOffer use case failed:', error);
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to reject offer' },
      };
    }
  }
}
