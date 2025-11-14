import { IEstateRepository } from '../../../domain/repositories/IEstateRepository';
import { EstateMapper } from '../mappers/EstateMapper';
import api from '../../../services/api';

/**
 * ApiEstateRepository - Concrete implementation of IEstateRepository
 */
export class ApiEstateRepository extends IEstateRepository {
  /**
   * Get all customer estates
   */
  async getCustomerEstates() {
    const response = await api.get('/api/v1/estates');
    const data = response.data;

    const estatesList = Array.isArray(data) ? data : (data?.content || []);
    return EstateMapper.toDomainList(estatesList);
  }

  /**
   * Create new estate
   */
  async create(estate) {
    const dto = EstateMapper.toDTO(estate);
    const response = await api.post('/api/v1/estates', dto);
    return EstateMapper.toDomain(response.data);
  }

  /**
   * Update existing estate
   */
  async update(estate) {
    const dto = EstateMapper.toUpdateDTO(estate);
    const response = await api.put('/api/v1/estates', dto);
    return EstateMapper.toDomain(response.data);
  }

  /**
   * Delete estate by ID
   */
  async delete(id) {
    await api.delete(`/api/v1/estates/${id}`);
  }
}
