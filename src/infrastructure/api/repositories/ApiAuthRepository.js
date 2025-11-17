import api from '../../../services/api';
import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

/**
 * API implementation of IAuthRepository
 */
export class ApiAuthRepository extends IAuthRepository {
  /**
   * Delete the current user's account
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  async deleteAccount() {
    await api.delete('/api/v1/auth/account');
  }
}
