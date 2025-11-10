import { Builder } from '../../../domain/entities/Builder';

/**
 * BuilderMapper - Data Transformation Layer
 * Converts between API DTOs and Domain Entities
 * Handles field name inconsistencies (uuid/publicId -> id)
 */
export class BuilderMapper {
  /**
   * Convert API data to Domain entity
   * @param {Object} apiData - Data from API
   * @returns {Builder}
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new Builder({
      id: apiData.uuid || apiData.publicId || apiData.id,
      fullName: apiData.fullName,
      email: apiData.email,
      phone: apiData.phone,
      avatarLink: apiData.avatarLink,
      role: apiData.role,
      login: apiData.login,
      ratingAvg: apiData.ratingAvg || 0,
      aboutMe: apiData.aboutMe,
      experienceYears: apiData.experienceYears || 0,
      city: apiData.city,
      district: apiData.district,
      jobsDone: apiData.jobsDone || 0,
      available: apiData.available !== undefined ? apiData.available : true,
      priceList: apiData.priceList,
    });
  }

  /**
   * Convert array of API data to Domain entities
   * @param {Array} apiDataArray - Array of API data
   * @returns {Builder[]}
   */
  static toDomainList(apiDataArray) {
    if (!Array.isArray(apiDataArray)) {
      return [];
    }
    return apiDataArray.map((data) => BuilderMapper.toDomain(data));
  }

  /**
   * Convert Domain entity to API DTO for update
   * @param {Builder} builder - Builder domain entity
   * @returns {Object} API DTO
   */
  static toUpdateDTO(builder) {
    return {
      fullName: builder.fullName,
      email: builder.email,
      phone: builder.phone,
      avatarLink: builder.avatarLink,
      aboutMe: builder.aboutMe,
      experienceYears: builder.experienceYears,
      city: builder.city,
      district: builder.district,
      available: builder.available,
    };
  }
}
