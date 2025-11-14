/**
 * CompleteContract Use Case
 * Both customer and builder can confirm completion
 * When both confirm: contract becomes COMPLETED, order becomes COMPLETED
 * When only one confirms: contract becomes PENDING_COMPLETION
 */
export class CompleteContract {
  constructor(contractRepository) {
    this.contractRepository = contractRepository;
  }

  /**
   * Execute the use case
   */
  async execute(contractId, completed) {
    if (!contractId) {
      return {
        success: false,
        errors: { contractId: 'Contract ID is required' },
      };
    }

    if (completed === undefined || completed === null) {
      return {
        success: false,
        errors: { completed: 'Completion status is required' },
      };
    }

    try {
      const contract = await this.contractRepository.complete(contractId, completed);

      return {
        success: true,
        contract,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to update contract completion' },
      };
    }
  }
}
