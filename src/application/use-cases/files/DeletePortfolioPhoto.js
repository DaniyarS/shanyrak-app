/**
 * DeletePortfolioPhoto Use Case
 * Business logic for deleting a portfolio photo
 */
export class DeletePortfolioPhoto {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the delete portfolio photo use case
   * @param {string} fileId - The file ID to delete
   * @returns {Promise<Object>} Result of deletion
   */
  async execute(fileId) {
    try {
      if (!fileId) {
        return {
          success: false,
          errors: { fileId: 'File ID is required' },
        };
      }

      const result = await this.fileRepository.delete(fileId);
      return result;
    } catch (error) {
      console.error('DeletePortfolioPhoto use case failed:', error);
      return {
        success: false,
        errors: { delete: error.message || 'Failed to delete portfolio photo' },
      };
    }
  }
}
