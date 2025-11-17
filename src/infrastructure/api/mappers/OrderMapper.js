import { Order } from '../../../domain/entities/Order';
import { CategoryMapper } from './CategoryMapper';
import { EstateMapper } from './EstateMapper';

/**
 * OrderMapper - Maps between API DTOs and Domain Entities
 * Handles field name inconsistencies (uuid/publicId)
 * Handles nested API response structure where order data is wrapped
 */
export class OrderMapper {
  /**
   * Map API response to Order entity
   * API Response Structure:
   * {
   *   order: { uuid, title, description, budgetMin, budgetMax, ... },
   *   category: { ... } or null,
   *   realEstate: { ... },
   *   appUser: { ... }
   * }
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    // Handle nested structure where order data is in 'order' property
    const orderData = apiData.order || apiData;

    return new Order({
      id: orderData.uuid || orderData.publicId || orderData.id,
      // Legacy fields
      title: orderData.title,
      budgetMin: orderData.budgetMin || 0,
      budgetMax: orderData.budgetMax || 0,
      // New fields
      description: orderData.description,
      price: orderData.price,
      unit: orderData.unit,
      priceType: orderData.priceType || 'NEGOTIABLE',
      category: apiData.category ? CategoryMapper.toDomain(apiData.category) : null,
      realEstate: apiData.realEstate ? EstateMapper.toDomain(apiData.realEstate) : null,
      status: orderData.status,
      createdAt: orderData.createdAt || orderData.createAt ? new Date(orderData.createdAt || orderData.createAt) : null,
      updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : null,
      offersCount: orderData.offersCount || apiData.offersCount || 0,
    });
  }

  /**
   * Map array of API responses to Order entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }

  /**
   * Map Order entity to API create request DTO
   */
  static toCreateDTO(order, categoryId, estateId) {
    const orderData = {
      description: order.description,
      priceType: order.priceType,
    };

    // Add price and unit only if price is provided
    if (order.price && order.price > 0) {
      orderData.price = order.price;
      orderData.unit = order.unit;
    }

    return {
      category: { publicId: categoryId },
      realEstate: { publicId: estateId },
      order: orderData,
    };
  }

  /**
   * Map Order entity to API update request DTO
   */
  static toUpdateDTO(order, categoryId, estateId) {
    const dto = {
      uuid: order.id,
      description: order.description,
      priceType: order.priceType,
    };

    // Add price and unit only if price is provided
    if (order.price && order.price > 0) {
      dto.price = order.price;
      dto.unit = order.unit;
    }

    // Include category and realEstate if provided
    if (categoryId) {
      dto.category = { publicId: categoryId };
    }
    if (estateId) {
      dto.realEstate = { publicId: estateId };
    }

    return dto;
  }
}
