/**
 * GetPortfolioPhotos Use Case
 * Business logic for fetching builder's portfolio photos
 */
export class GetPortfolioPhotos {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the get portfolio photos use case
   * @param {string} builderPublicId - Optional builder public ID (for viewing other builders' portfolios)
   * @returns {Promise<Object>} Result with portfolio photos
   */
  async execute(builderPublicId = null) {
    try {
      const result = await this.fileRepository.getFiles('BUILDER_PORTFOLIO', builderPublicId);

      if (result.success) {
        // Sort files by sortOrder
        const sortedFiles = result.files.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        return {
          success: true,
          files: sortedFiles,
        };
      }

      return result;
    } catch (error) {
      console.error('GetPortfolioPhotos use case failed:', error);
      return {
        success: false,
        files: [],
        errors: { fetch: error.message || 'Failed to fetch portfolio photos' },
      };
    }
  }
}
