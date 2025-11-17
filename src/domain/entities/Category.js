/**
 * Category Entity - Domain Model
 * Represents a service category
 */
export class Category {
  constructor({
    id,
    name,
    description,
    parentId,
    emoji,
    createdAt,
    updatedAt,
    children = [],
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parentId = parentId;
    this.emoji = emoji || '📦'; // Default emoji if not provided
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.children = children;

    Object.freeze(this);
  }

  /**
   * Check if this is a root category
   */
  isRootCategory() {
    return !this.parentId;
  }

  /**
   * Check if this is a leaf category (has no children)
   */
  isLeafCategory() {
    return !this.children || this.children.length === 0;
  }

  /**
   * Validate category data
   */
  static validate(data) {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Category name is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Extract all leaf categories from a tree
   * @param {Category[]} categories - Array of category trees
   * @param {string} parentPath - Parent path for building full category path
   * @returns {Array<{category: Category, path: string}>}
   */
  static extractLeafCategories(categories, parentPath = '') {
    const leaves = [];

    for (const category of categories) {
      const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;

      if (category.isLeafCategory()) {
        leaves.push({
          category,
          path: currentPath,
        });
      } else if (category.children && category.children.length > 0) {
        // Recursively extract from children
        const childLeaves = Category.extractLeafCategories(category.children, currentPath);
        leaves.push(...childLeaves);
      }
    }

    return leaves;
  }
}
