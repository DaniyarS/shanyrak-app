import { Offer } from '../../../domain/entities/Offer';

/**
 * UpdateOffer Use Case
 * Builder can update their own offer if status is PENDING
 */
export class UpdateOffer {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the use case
   */
  async execute(offerId, offerData) {
    const validation = Offer.validate({ ...offerData, orderId: 'temp' });

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const offer = new Offer({
        id: offerId,
        ...offerData,
        orderId: offerData.orderId || 'temp',
      });

      const updatedOffer = await this.offerRepository.update(offerId, offer);

      return {
        success: true,
        offer: updatedOffer,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to update offer' },
      };
    }
  }
}
