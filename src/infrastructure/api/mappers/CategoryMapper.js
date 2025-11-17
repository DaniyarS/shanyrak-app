import { Category } from '../../../domain/entities/Category';

/**
 * CategoryMapper - Maps between API DTOs and Category Domain Entities
 */
export class CategoryMapper {
  /**
   * Map API response to Category entity (without children)
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Category({
      id: apiData.publicId || apiData.uuid || apiData.id,
      name: apiData.name,
      description: apiData.description,
      parentId: apiData.parentId || null,
      emoji: apiData.emoji || apiData.icon || '📦',
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
    });
  }

  /**
   * Map API response to Category entity with children (for tree structure)
   */
  static toDomainTree(apiData) {
    if (!apiData) return null;

    const children = apiData.children
      ? apiData.children.map(child => this.toDomainTree(child)).filter(Boolean)
      : [];

    return new Category({
      id: apiData.publicId || apiData.uuid || apiData.id,
      name: apiData.name,
      description: apiData.description,
      parentId: apiData.parentId || null,
      emoji: apiData.emoji || apiData.icon || '📦',
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
      children,
    });
  }

  /**
   * Map array of API responses to Category entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }

  /**
   * Map array of API responses to Category tree entities
   */
  static toDomainTreeList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomainTree(item)).filter(Boolean);
  }
}
