import { Category } from '../../../domain/entities/Category';

/**
 * GetCategoryTree use case
 * Fetches the category tree and optionally extracts leaf categories
 */
export class GetCategoryTree {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  /**
   * Get category tree
   * @param {boolean} leafOnly - If true, returns only leaf categories with their paths
   * @returns {Promise<{success: boolean, categories?: Array, leafCategories?: Array, errors?: object}>}
   */
  async execute(leafOnly = false) {
    try {
      const categoryTree = await this.categoryRepository.getTree();

      if (leafOnly) {
        // Extract leaf categories with their paths
        const leafCategories = Category.extractLeafCategories(categoryTree);

        return {
          success: true,
          leafCategories,
          categories: categoryTree,
        };
      }

      return {
        success: true,
        categories: categoryTree,
      };
    } catch (error) {
      console.error('Error fetching category tree:', error);

      return {
        success: false,
        errors: {
          message: error.response?.data?.message || 'Failed to fetch category tree',
        },
      };
    }
  }
}
