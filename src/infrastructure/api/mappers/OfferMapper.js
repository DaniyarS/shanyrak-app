import { Offer } from '../../../domain/entities/Offer';

/**
 * OfferMapper - Maps between API DTOs and Offer Domain Entities
 */
export class OfferMapper {
  /**
   * Map API response to Offer entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Offer({
      id: apiData.publicId || apiData.uuid || apiData.id,
      orderId: apiData.orderId || (apiData.order && apiData.order.uuid),
      price: apiData.price,
      unit: apiData.unit,
      daysEstimate: apiData.daysEstimate,
      message: apiData.message,
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
    });
  }

  /**
   * Map array of API responses to Offer entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }

  /**
   * Map Offer entity to API create request DTO
   */
  static toCreateDTO(offer, orderId) {
    return {
      order: { uuid: orderId },
      offer: {
        price: offer.price,
        message: offer.message,
        unit: offer.unit,
        daysEstimate: offer.daysEstimate,
      },
    };
  }
}
