import { WasteCategory } from '../../../domain/entities/WasteCategory.js';

export class WasteCategoryMapper {
  static toDomain(apiData) {
    if (!apiData) return null;

    return new WasteCategory({
      id: apiData.publicId || apiData.id,
      slug: apiData.slug,
      name: apiData.name,
      nameKz: apiData.nameKz,
      nameEn: apiData.nameEng || apiData.nameEn,
      icon: apiData.icon,
      children: apiData.children ? apiData.children.map(child => WasteCategoryMapper.toDomain(child)) : null,
      parent: apiData.parent ? WasteCategoryMapper.toDomain(apiData.parent) : null
    });
  }

  static toDomainArray(apiArray) {
    if (!Array.isArray(apiArray)) return [];
    return apiArray.map(item => WasteCategoryMapper.toDomain(item));
  }
}
