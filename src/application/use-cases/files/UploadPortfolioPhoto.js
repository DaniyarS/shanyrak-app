/**
 * UploadPortfolioPhoto Use Case
 * Business logic for uploading portfolio photos for builders
 */
export class UploadPortfolioPhoto {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the upload portfolio photo use case
   * @param {File} file - The file to upload
   * @param {number} sortOrder - Sort order for the photo
   * @returns {Promise<Object>} Result with uploaded file data
   */
  async execute(file, sortOrder = 0) {
    try {
      // Validate file
      if (!file) {
        return {
          success: false,
          file: null,
          errors: { file: 'No file provided' },
        };
      }

      // Validate file type (images only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          file: null,
          errors: { file: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' },
        };
      }

      // Validate file size (max 10MB for portfolio photos)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          file: null,
          errors: { file: 'File size must be less than 10MB' },
        };
      }

      // Upload the file
      const result = await this.fileRepository.upload(file, 'portfolio', 'BUILDER_PORTFOLIO', null, sortOrder);

      return result;
    } catch (error) {
      console.error('UploadPortfolioPhoto use case failed:', error);
      return {
        success: false,
        file: null,
        errors: { submit: error.message || 'Failed to upload portfolio photo' },
      };
    }
  }
}
