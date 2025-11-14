import { Offer } from '../../../domain/entities/Offer';

/**
 * CreateOffer Use Case
 */
export class CreateOffer {
  constructor(offerRepository) {
    this.offerRepository = offerRepository;
  }

  /**
   * Execute the use case
   */
  async execute(offerData, orderId) {
    const validation = Offer.validate({ ...offerData, orderId });

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const offer = new Offer({
        id: null,
        ...offerData,
        orderId,
      });

      const createdOffer = await this.offerRepository.create(offer, orderId);

      return {
        success: true,
        offer: createdOffer,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to create offer' },
      };
    }
  }
}
