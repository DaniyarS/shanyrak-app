/**
 * GetBuilderPhone Use Case
 * Business logic for getting a builder's phone number
 */
export class GetBuilderPhone {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  /**
   * Execute the get builder phone use case
   * @param {string} builderId - Builder ID
   * @returns {Promise<Object>} Result with phone number data
   */
  async execute(builderId) {
    try {
      if (!builderId) {
        return {
          success: false,
          phone: null,
          error: 'Builder ID is required',
        };
      }

      const phoneData = await this.builderRepository.getPhone(builderId);

      return {
        success: true,
        phone: phoneData.phone || phoneData,
      };
    } catch (error) {
      console.error('GetBuilderPhone use case failed:', error);
      return {
        success: false,
        phone: null,
        error: error.message || 'Failed to get builder phone',
      };
    }
  }
}
