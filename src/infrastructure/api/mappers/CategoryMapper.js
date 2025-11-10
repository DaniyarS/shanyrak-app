import { Category } from '../../../domain/entities/Category';

/**
 * CategoryMapper - Maps between API DTOs and Category Domain Entities
 */
export class CategoryMapper {
  /**
   * Map API response to Category entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Category({
      id: apiData.publicId || apiData.uuid || apiData.id,
      name: apiData.name,
      description: apiData.description,
      parentId: apiData.parentId || null,
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
    });
  }

  /**
   * Map array of API responses to Category entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }
}
