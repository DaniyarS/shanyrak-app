/**
 * Interface for authentication and account management operations
 */
export class IAuthRepository {
  /**
   * Delete the current user's account
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  async deleteAccount() {
    throw new Error('Method deleteAccount() must be implemented');
  }
}
