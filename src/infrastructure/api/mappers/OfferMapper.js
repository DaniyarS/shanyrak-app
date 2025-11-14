import { Offer } from '../../../domain/entities/Offer';
import { BuilderMapper } from './BuilderMapper';

/**
 * OfferMapper - Maps between API DTOs and Offer Domain Entities
 */
export class OfferMapper {
  /**
   * Map API response to Offer entity
   * Handles both nested format (from searchByOrder) and flat format
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    // Check if data is nested (from searchByOrder endpoint)
    const offerData = apiData.offer || apiData;
    const builderData = apiData.appUser || apiData.builder;

    return new Offer({
      id: offerData.publicId || offerData.uuid || offerData.id,
      orderId: offerData.orderId || (apiData.order && apiData.order.uuid),
      price: offerData.price,
      unit: offerData.unit,
      daysEstimate: offerData.daysEstimate,
      message: offerData.message,
      status: offerData.status,
      createdAt: offerData.createdAt ? new Date(offerData.createdAt) : null,
      updatedAt: offerData.updatedAt ? new Date(offerData.updatedAt) : null,
      builder: builderData ? BuilderMapper.toDomain(builderData) : null,
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

  /**
   * Map Offer entity to API update request DTO
   */
  static toUpdateDTO(offer) {
    return {
      price: offer.price,
      message: offer.message,
      unit: offer.unit,
      daysEstimate: offer.daysEstimate,
    };
  }
}
