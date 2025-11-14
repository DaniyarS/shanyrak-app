/**
 * SearchBuilders Use Case
 * Business logic for searching builders with filters
 */
export class SearchBuilders {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  /**
   * Execute the search builders use case
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Result with builders array
   */
  async execute(filters = {}) {
    try {
      const builders = await this.builderRepository.search(filters);

      return {
        success: true,
        builders,
      };
    } catch (error) {
      console.error('SearchBuilders use case failed:', error);
      return {
        success: false,
        builders: [],
        error: error.message || 'Failed to search builders',
      };
    }
  }
}
