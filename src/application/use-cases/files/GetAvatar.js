/**
 * GetAvatar Use Case
 * Business logic for fetching a user's avatar
 */
export class GetAvatar {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the get avatar use case
   * @param {string} userPublicId - Optional user public ID (for viewing other users' avatars)
   * @returns {Promise<Object>} Result with avatar file data
   */
  async execute(userPublicId = null) {
    try {
      const result = await this.fileRepository.getFiles('USER_AVATAR', userPublicId);

      if (result.success && result.files && result.files.length > 0) {
        // Return the first (and should be only) avatar
        return {
          success: true,
          file: result.files[0],
        };
      }

      return {
        success: true,
        file: null, // No avatar found
      };
    } catch (error) {
      console.error('GetAvatar use case failed:', error);
      return {
        success: false,
        file: null,
        errors: { fetch: error.message || 'Failed to fetch avatar' },
      };
    }
  }
}
