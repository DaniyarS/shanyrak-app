/**
 * Use case for deleting the current user's account
 */
export class DeleteAccount {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Delete the current user's account
   * @returns {Promise<{success: boolean, errors?: object}>}
   */
  async execute() {
    try {
      await this.authRepository.deleteAccount();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting account:', error);

      return {
        success: false,
        errors: {
          message: error.response?.data?.message || 'Failed to delete account',
        },
      };
    }
  }
}
