import api from '../../../services/api';
import { IBuilderRepository } from '../../../domain/repositories/IBuilderRepository';
import { BuilderMapper } from '../mappers/BuilderMapper';

/**
 * ApiBuilderRepository - Concrete Implementation
 * Implements IBuilderRepository using HTTP API
 */
export class ApiBuilderRepository extends IBuilderRepository {
  /**
   * Search builders with filters
   */
  async search(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.categoryPublicId) params.append('categoryPublicId', filters.categoryPublicId);
      if (filters.city) params.append('city', filters.city);
      if (filters.ratingFrom !== undefined) params.append('ratingFrom', filters.ratingFrom);
      if (filters.priceFrom !== undefined) params.append('priceFrom', filters.priceFrom);
      if (filters.priceTo !== undefined) params.append('priceTo', filters.priceTo);
      if (filters.availability !== undefined) params.append('availability', filters.availability);
      if (filters.q) params.append('q', filters.q);
      if (filters.page !== undefined) params.append('page', filters.page);
      if (filters.size !== undefined) params.append('size', filters.size);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/api/v1/builders/search?${params.toString()}`);

      // Handle paginated response
      const data = response.data;
      const builders = Array.isArray(data) ? data : data?.content || [];

      return BuilderMapper.toDomainList(builders);
    } catch (error) {
      console.error('Error searching builders:', error);
      throw error;
    }
  }

  /**
   * Get builder by ID
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/v1/builders/${id}`);
      return BuilderMapper.toDomain(response.data);
    } catch (error) {
      console.error('Error getting builder:', error);
      throw error;
    }
  }

  /**
   * Get current builder (me)
   */
  async getMe() {
    try {
      const response = await api.get('/api/v1/builders/me');
      return BuilderMapper.toDomain(response.data);
    } catch (error) {
      console.error('Error getting current builder:', error);
      throw error;
    }
  }

  /**
   * Update builder
   */
  async update(id, data) {
    try {
      const dto = BuilderMapper.toUpdateDTO(data);
      const response = await api.put(`/api/v1/builders/${id}`, dto);
      return BuilderMapper.toDomain(response.data);
    } catch (error) {
      console.error('Error updating builder:', error);
      throw error;
    }
  }
}
