/**
 * GetUserContracts Use Case
 * Get contracts for the current user (customer or builder)
 */
export class GetUserContracts {
  constructor(contractRepository) {
    this.contractRepository = contractRepository;
  }

  /**
   * Execute the use case
   */
  async execute(params = {}) {
    try {
      const contracts = await this.contractRepository.getUserContracts(params);

      return {
        success: true,
        contracts,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to get contracts' },
      };
    }
  }
}
