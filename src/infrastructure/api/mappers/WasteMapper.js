import { Waste } from '../../../domain/entities/Waste.js';
import { WasteCategoryMapper } from './WasteCategoryMapper.js';

export class WasteMapper {
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Waste({
      id: apiData.publicId || apiData.id,
      title: apiData.title,
      description: apiData.description,
      category: apiData.category ? WasteCategoryMapper.toDomain(apiData.category) : null,
      city: apiData.city,
      district: apiData.district,
      unit: apiData.unit,
      amount: apiData.amount,
      price: apiData.price,
      status: apiData.status,
      photos: apiData.photos || [],
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      owner: apiData.owner || null
    });
  }

  static toDomainArray(apiArray) {
    if (!Array.isArray(apiArray)) return [];
    return apiArray.map(item => WasteMapper.toDomain(item));
  }

  static toDTO(waste) {
    return {
      title: waste.title,
      description: waste.description,
      categoryPublicId: waste.category?.id,
      city: waste.city,
      district: waste.district,
      unit: waste.unit,
      amount: waste.amount,
      price: waste.price
    };
  }
}
