import { IContractRepository } from '../../../domain/repositories/IContractRepository';
import { ContractMapper } from '../mappers/ContractMapper';
import api from '../../../services/api';

/**
 * ApiContractRepository - Concrete implementation of IContractRepository
 */
export class ApiContractRepository extends IContractRepository {
  /**
   * Get contract by ID
   */
  async getById(id) {
    const response = await api.get(`/api/v1/contracts/${id}`);
    return ContractMapper.toDomain(response.data);
  }

  /**
   * Complete contract (confirm completion by customer or builder)
   * POST /api/v1/contracts/{contractId}/complete
   */
  async complete(contractId, completed) {
    const response = await api.post(`/api/v1/contracts/${contractId}/complete`, {
      completed,
    });
    return ContractMapper.toDomain(response.data);
  }

  /**
   * Get contracts for current user
   */
  async getUserContracts(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
      queryParams.append('page', params.page);
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const response = await api.get(`/api/v1/contracts?${queryParams.toString()}`);
    const data = response.data;

    const contractsList = Array.isArray(data) ? data : (data?.content || []);
    return ContractMapper.toDomainList(contractsList);
  }
}
