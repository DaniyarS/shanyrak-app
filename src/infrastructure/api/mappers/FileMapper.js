import { File } from '../../../domain/entities/File';

/**
 * FileMapper - Maps between API DTOs and File Domain Entities
 */
export class FileMapper {
  /**
   * Map API response to File entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new File({
      id: apiData.uuid || apiData.publicId || apiData.id,
      publicId: apiData.publicId || apiData.uuid,
      url: apiData.url || apiData.link,
      linkType: apiData.linkType,
      linkPublicId: apiData.linkPublicId,
      scope: apiData.scope,
      sortOrder: apiData.sortOrder,
      createdAt: apiData.createdAt,
    });
  }

  /**
   * Map array of API responses to File entities
   */
  static toDomainArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(item => this.toDomain(item));
  }

  /**
   * Create FormData for file upload
   */
  static toUploadFormData(file, scope, linkType, linkPublicId = null, sortOrder = 0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', scope);
    formData.append('linkType', linkType);

    if (linkPublicId) {
      formData.append('linkPublicId', linkPublicId);
    }

    if (sortOrder !== undefined && sortOrder !== null) {
      formData.append('sortOrder', sortOrder.toString());
    }

    return formData;
  }
}
