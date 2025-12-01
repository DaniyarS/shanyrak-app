/**
 * AddBuilderCategory Use Case
 * Handles adding a category to a builder's price list
 */
export class AddBuilderCategory {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  async execute(builderId, categoryData) {
    try {
      // Validate input
      if (!builderId) {
        return { success: false, errors: { builderId: 'Builder ID is required' } };
      }

      if (!categoryData.category?.publicId) {
        return { success: false, errors: { categoryPublicId: 'Category ID is required' } };
      }

      if (!categoryData.price || categoryData.price <= 0) {
        return { success: false, errors: { price: 'Valid price is required' } };
      }

      const builder = await this.builderRepository.addCategory(builderId, categoryData);
      
      return { success: true, builder };
    } catch (error) {
      console.error('AddBuilderCategory failed:', error);
      
      if (error.response?.data?.message) {
        return { success: false, errors: { submit: error.response.data.message } };
      }
      
      return { success: false, errors: { submit: 'Failed to add category' } };
    }
  }
}