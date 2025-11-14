import { Estate } from '../../../domain/entities/Estate';

/**
 * EstateMapper - Maps between API DTOs and Estate Domain Entities
 * Handles field name variations: lat/latitude, lon/longitude
 */
export class EstateMapper {
  /**
   * Map API response to Estate entity
   * API uses 'lat' and 'lon' instead of 'latitude' and 'longitude'
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Estate({
      id: apiData.publicId || apiData.uuid || apiData.id,
      kind: apiData.kind,
      addressLine: apiData.addressLine,
      city: apiData.city,
      district: apiData.district,
      latitude: apiData.latitude || apiData.lat,
      longitude: apiData.longitude || apiData.lon,
      areaM2: apiData.areaM2,
      floor: apiData.floor,
      createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
      updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : null,
    });
  }

  /**
   * Map array of API responses to Estate entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }

  /**
   * Map Estate entity to API create/update request DTO
   * API expects 'lat' and 'lon' instead of 'latitude' and 'longitude'
   */
  static toDTO(estate) {
    return {
      kind: estate.kind,
      addressLine: estate.addressLine,
      city: estate.city,
      district: estate.district,
      lat: estate.latitude || 0,
      lon: estate.longitude || 0,
      areaM2: estate.areaM2,
      floor: estate.floor || 0,
    };
  }

  /**
   * Map Estate entity to API update request DTO (includes publicId)
   */
  static toUpdateDTO(estate) {
    return {
      publicId: estate.id,
      ...this.toDTO(estate),
    };
  }
}
