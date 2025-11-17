import { City } from '../../../domain/entities/City';

/**
 * CityMapper - Maps between API DTOs and City Domain Entities
 */
export class CityMapper {
  /**
   * Map API response to City entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new City({
      id: apiData.publicId || apiData.uuid || apiData.id,
      name: apiData.name,
      nameKz: apiData.nameKz,
      code: apiData.code,
      region: apiData.region,
      regionKz: apiData.regionKz,
      isMajor: apiData.isMajor || false,
      sortOrder: apiData.sortOrder || 999,
    });
  }

  /**
   * Map array of API responses to City entities
   */
  static toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) return [];
    return apiDataList.map(item => this.toDomain(item)).filter(Boolean);
  }
}
