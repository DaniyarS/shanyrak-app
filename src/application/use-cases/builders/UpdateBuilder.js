/**
 * UpdateBuilder Use Case
 * Business logic for updating a builder's profile
 */
export class UpdateBuilder {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  /**
   * Execute the update builder use case
   * @param {string} id - Builder ID
   * @param {Object} data - Builder data to update
   * @returns {Promise<Object>} Result with updated builder data
   */
  async execute(id, data) {
    try {
      console.log('UpdateBuilder use case - ID:', id);
      console.log('UpdateBuilder use case - Data:', data);

      if (!id) {
        return {
          success: false,
          builder: null,
          errors: { id: 'Builder ID is required' },
        };
      }

      // Validate required fields
      const errors = {};
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.fullName = 'Full name is required and must be at least 2 characters';
      }
      if (!data.phone || data.phone.trim().length === 0) {
        errors.phone = 'Phone number is required';
      }

      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        return {
          success: false,
          builder: null,
          errors,
        };
      }

      console.log('Calling repository update...');
      const builder = await this.builderRepository.update(id, data);
      console.log('Repository update success:', builder);

      return {
        success: true,
        builder,
      };
    } catch (error) {
      console.error('UpdateBuilder use case failed:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        builder: null,
        errors: { submit: error.response?.data?.message || error.message || 'Failed to update builder' },
      };
    }
  }
}
