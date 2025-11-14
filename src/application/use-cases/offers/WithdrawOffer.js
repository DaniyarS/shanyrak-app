/**
 * WithdrawOffer Use Case
 * Builder can withdraw their own offer (sets status to WITHDRAWN)
 */
export class WithdrawOffer {
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
      await this.offerRepository.withdraw(offerId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to withdraw offer' },
      };
    }
  }
}
