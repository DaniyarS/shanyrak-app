import { Contract } from '../../../domain/entities/Contract';

/**
 * ContractMapper - Maps between API DTOs and Contract Domain Entities
 */
export class ContractMapper {
  /**
   * Map API response to Contract entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Contract({
      id: apiData.publicId || apiData.uuid || apiData.id,
      orderId: apiData.orderId || (apiData.order && (apiData.order.uuid || apiData.order.publicId)),
      offerId: apiData.offerId || (apiData.offer && (apiData.offer.publicId || apiData.offer.uuid)),
      status: apiData.status,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      customerConfirmedComplete: apiData.customerConfirmedComplete || false,
      builderConfirmedComplete: apiData.builderConfirmedComplete || false,
      completionRequestedAt: apiData.completionRequestedAt ? new Date(apiData.completionRequestedAt) : null,
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
    });
  }

  /**
   * Map array of API responses to Contract entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }
}
