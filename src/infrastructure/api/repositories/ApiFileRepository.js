import { IFileRepository } from '../../../domain/repositories/IFileRepository';
import { FileMapper } from '../mappers/FileMapper';
import api from '../../../services/api';

/**
 * ApiFileRepository - Concrete implementation of IFileRepository
 */
export class ApiFileRepository extends IFileRepository {
  /**
   * Upload a file
   */
  async upload(file, scope, linkType, linkPublicId = null, sortOrder = 0) {
    try {
      const formData = FileMapper.toUploadFormData(file, scope, linkType, linkPublicId, sortOrder);

      const response = await api.post('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFile = FileMapper.toDomain(response.data);

      return {
        success: true,
        file: uploadedFile,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        errors: {
          upload: error.response?.data?.message || 'Failed to upload file',
        },
      };
    }
  }

  /**
   * Get files by link type and optional link public ID
   */
  async getFiles(linkType, linkPublicId = null) {
    try {
      const params = { linkType };
      if (linkPublicId) {
        params.linkPublicId = linkPublicId;
      }

      const response = await api.get('/api/v1/files', { params });
      const files = FileMapper.toDomainArray(response.data);

      return {
        success: true,
        files,
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      return {
        success: false,
        errors: {
          fetch: error.response?.data?.message || 'Failed to fetch files',
        },
      };
    }
  }

  /**
   * Delete a file by ID
   */
  async delete(fileId) {
    try {
      await api.delete(`/api/v1/files/${fileId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        errors: {
          delete: error.response?.data?.message || 'Failed to delete file',
        },
      };
    }
  }
}
