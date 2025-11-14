import { Review } from '../../../domain/entities/Review';

/**
 * ReviewMapper - Maps between API DTOs and Review Domain Entities
 */
export class ReviewMapper {
  /**
   * Map API response to Review entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Review({
      id: apiData.publicId || apiData.uuid || apiData.id,
      contractId: apiData.contractId || (apiData.contract && (apiData.contract.publicId || apiData.contract.uuid)),
      rating: apiData.rating,
      message: apiData.message,
      reviewerRole: apiData.reviewerRole,
      reviewerName: apiData.reviewerName,
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
    });
  }

  /**
   * Map array of API responses to Review entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }

  /**
   * Map Review entity to API create request DTO
   */
  static toCreateDTO(review, contractId) {
    return {
      contractPublicId: contractId,
      rating: review.rating,
      message: review.message,
    };
  }
}
