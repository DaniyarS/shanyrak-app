/**
 * ICategoryRepository - Repository Interface (Abstraction)
 */
export class ICategoryRepository {
  /**
   * Get all categories
   * @returns {Promise<Array<Category>>}
   */
  async getAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Category>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get children categories
   * @param {string} id - Parent category ID
   * @returns {Promise<Array<Category>>}
   */
  async getChildren(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get category tree (hierarchical structure with nested children)
   * @returns {Promise<Array<Category>>}
   */
  async getTree() {
    throw new Error('Method not implemented');
  }
}
