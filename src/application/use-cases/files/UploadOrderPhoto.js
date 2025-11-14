/**
 * UploadOrderPhoto Use Case
 * Business logic for uploading order photos
 */
export class UploadOrderPhoto {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the upload order photo use case
   * @param {File} file - The image file to upload
   * @param {string} orderPublicId - The order's public ID
   * @param {number} sortOrder - Optional sort order for the photo
   * @returns {Promise<Object>} Result with uploaded file data
   */
  async execute(file, orderPublicId, sortOrder = 0) {
    try {
      // Validate file
      if (!file) {
        return {
          success: false,
          errors: { file: 'No file provided' },
        };
      }

      if (!orderPublicId) {
        return {
          success: false,
          errors: { orderPublicId: 'Order ID is required' },
        };
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          errors: { file: 'File must be an image' },
        };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          errors: { file: 'File size must be less than 10MB' },
        };
      }

      // Upload the file
      const result = await this.fileRepository.upload(
        file,
        'orders',
        'ORDER_PHOTO',
        orderPublicId,
        sortOrder
      );

      return result;
    } catch (error) {
      console.error('UploadOrderPhoto use case failed:', error);
      return {
        success: false,
        errors: { upload: error.message || 'Failed to upload order photo' },
      };
    }
  }
}
