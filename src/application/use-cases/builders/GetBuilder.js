/**
 * GetBuilder Use Case
 * Business logic for getting a single builder by ID
 */
export class GetBuilder {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  /**
   * Execute the get builder use case
   * @param {string} id - Builder ID (optional - if not provided, gets current user)
   * @returns {Promise<Object>} Result with builder data
   */
  async execute(id) {
    try {
      let builder;

      if (!id) {
        // Get current builder (me)
        builder = await this.builderRepository.getMe();
      } else {
        // Get builder by ID
        builder = await this.builderRepository.getById(id);
      }

      return {
        success: true,
        builder,
      };
    } catch (error) {
      console.error('GetBuilder use case failed:', error);
      return {
        success: false,
        builder: null,
        error: error.message || 'Failed to get builder',
      };
    }
  }
}
