/**
 * DeleteBuilderCategory Use Case
 * Handles removing a category from a builder's price list
 */
export class DeleteBuilderCategory {
  constructor(builderRepository) {
    this.builderRepository = builderRepository;
  }

  async execute(priceListId) {
    try {
      // Validate input
      if (!priceListId) {
        return { success: false, errors: { priceListId: 'Price list ID is required' } };
      }

      await this.builderRepository.deleteCategory(priceListId);
      
      return { success: true };
    } catch (error) {
      console.error('DeleteBuilderCategory failed:', error);
      
      if (error.response?.data?.message) {
        return { success: false, errors: { submit: error.response.data.message } };
      }
      
      return { success: false, errors: { submit: 'Failed to delete category' } };
    }
  }
}