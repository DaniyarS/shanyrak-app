/**
 * ICityRepository - Repository Interface (Abstraction)
 */
export class ICityRepository {
  /**
   * Get all cities
   * @returns {Promise<Array<City>>}
   */
  async getAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Get major cities
   * @returns {Promise<Array<City>>}
   */
  async getMajorCities() {
    throw new Error('Method not implemented');
  }

  /**
   * Get city by ID
   * @param {string} id - City ID
   * @returns {Promise<City>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }
}
