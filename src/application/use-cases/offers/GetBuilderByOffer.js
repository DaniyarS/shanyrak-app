/**
 * GetBuilderByOffer Use Case
 * Get builder information by offer ID
 */
export class GetBuilderByOffer {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the use case
   */
  async execute(offerId) {
    if (!offerId) {
      return {
        success: false,
        errors: { offerId: 'Offer ID is required' },
      };
    }

    try {
      const builder = await this.offerRepository.getBuilderByOfferId(offerId);

      return {
        success: true,
        builder,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to get builder information' },
      };
    }
  }
}
