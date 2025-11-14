/**
 * IContractRepository - Repository Interface (Abstraction)
 * Follows Interface Segregation Principle and Dependency Inversion Principle
 * Domain layer depends on this abstraction, not on concrete implementations
 */
export class IContractRepository {
  /**
   * Get contract by ID
   * @param {string} id - Contract ID
   * @returns {Promise<Contract>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Complete contract (confirm completion by customer or builder)
   * @param {string} contractId - Contract ID
   * @param {boolean} completed - Completion status
   * @returns {Promise<Contract>}
   */
  async complete(contractId, completed) {
    throw new Error('Method not implemented');
  }

  /**
   * Get contracts for current user
   * @param {Object} params - Pagination params { page, size, status }
   * @returns {Promise<Array<Contract>>}
   */
  async getUserContracts(params) {
    throw new Error('Method not implemented');
  }
}
