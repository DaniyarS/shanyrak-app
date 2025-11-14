/**
 * UploadAvatar Use Case
 * Business logic for uploading a user's avatar
 */
export class UploadAvatar {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the upload avatar use case
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} Result with uploaded file data
   */
  async execute(file) {
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

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          file: null,
          errors: { file: 'File size must be less than 5MB' },
        };
      }

      // Upload the file
      const result = await this.fileRepository.upload(file, 'avatars', 'USER_AVATAR');

      return result;
    } catch (error) {
      console.error('UploadAvatar use case failed:', error);
      return {
        success: false,
        file: null,
        errors: { submit: error.message || 'Failed to upload avatar' },
      };
    }
  }
}
