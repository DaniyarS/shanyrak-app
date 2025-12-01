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

      console.log('Searching builders with URL:', `/api/v1/builders/search?${params.toString()}`);
      const response = await api.get(`/api/v1/builders/search?${params.toString()}`);

      console.log('Builder search API response:', response.data);

      // Handle paginated response
      const data = response.data;
      const builders = Array.isArray(data) ? data : data?.content || [];

      console.log('Raw builders data from API:', builders);
      console.log('Sample builder with avatar info:', builders[0]);

      const domainBuilders = BuilderMapper.toDomainList(builders);
      console.log('Mapped domain builders:', domainBuilders);
      console.log('Sample mapped builder:', domainBuilders[0]);

      return domainBuilders;
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
      console.log('ApiBuilderRepository - Update DTO:', dto);
      console.log('ApiBuilderRepository - URL:', `/api/v1/builders/${id}`);

      const response = await api.put(`/api/v1/builders/${id}`, dto);
      console.log('ApiBuilderRepository - Response:', response.data);

      return BuilderMapper.toDomain(response.data);
    } catch (error) {
      console.error('Error updating builder:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Add category to builder
   */
  async addCategory(builderId, categoryData) {
    try {
      const response = await api.post(`/api/v1/builders/${builderId}/category`, {
        category: {
          publicId: categoryData.category.publicId
        },
        price: categoryData.price,
        description: categoryData.description
      });
      return BuilderMapper.toDomain(response.data);
    } catch (error) {
      console.error('Error adding builder category:', error);
      throw error;
    }
  }

  /**
   * Delete category from builder
   */
  async deleteCategory(priceListId) {
    try {
      const response = await api.delete(`/api/v1/builders/category/${priceListId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting builder category:', error);
      throw error;
    }
  }
}
