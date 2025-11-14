/**
 * DeleteOrderPhoto Use Case
 * Business logic for deleting order photos
 */
export class DeleteOrderPhoto {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the delete order photo use case
   * @param {string} photoId - The photo's ID to delete
   * @returns {Promise<Object>} Result indicating success or failure
   */
  async execute(photoId) {
    try {
      if (!photoId) {
        return {
          success: false,
          errors: { photoId: 'Photo ID is required' },
        };
      }

      const result = await this.fileRepository.delete(photoId);

      return result;
    } catch (error) {
      console.error('DeleteOrderPhoto use case failed:', error);
      return {
        success: false,
        errors: { delete: error.message || 'Failed to delete order photo' },
      };
    }
  }
}
