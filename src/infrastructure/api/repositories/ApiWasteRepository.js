import api from '../../../services/api.js';
import { IWasteRepository } from '../../../domain/repositories/IWasteRepository.js';
import { WasteMapper } from '../mappers/WasteMapper.js';

export class ApiWasteRepository extends IWasteRepository {
  async create(waste) {
    try {
      const dto = WasteMapper.toDTO(waste);
      const response = await api.post('/api/v1/waste', dto);
      return WasteMapper.toDomain(response.data);
    } catch (error) {
      throw new Error(`Failed to create waste: ${error.message}`);
    }
  }

  async update(id, waste) {
    try {
      const dto = WasteMapper.toDTO(waste);
      const response = await api.put(`/api/v1/waste/${id}`, dto);
      return WasteMapper.toDomain(response.data);
    } catch (error) {
      throw new Error(`Failed to update waste: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await api.delete(`/api/v1/waste/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete waste: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`/api/v1/waste/${id}`);
      return WasteMapper.toDomain(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch waste: ${error.message}`);
    }
  }

  async search(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.city) params.append('city', filters.city);
      if (filters.onlyFree !== undefined) params.append('onlyFree', filters.onlyFree);
      if (filters.categoryPublicId) params.append('categoryPublicId', filters.categoryPublicId);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
      if (filters.q) params.append('q', filters.q);
      if (filters.sort) params.append('sort', filters.sort);

      params.append('page', filters.page || 0);
      params.append('size', filters.size || 20);

      const response = await api.get(`/api/v1/waste?${params.toString()}`);

      return {
        content: WasteMapper.toDomainArray(response.data.content || response.data),
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        number: response.data.number,
        size: response.data.size
      };
    } catch (error) {
      throw new Error(`Failed to search waste: ${error.message}`);
    }
  }

  async getMyWaste(page = 0, size = 20) {
    try {
      const params = new URLSearchParams({ page, size });
      const response = await api.get(`/api/v1/waste/my?${params.toString()}`);

      return {
        content: WasteMapper.toDomainArray(response.data.content || response.data),
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        number: response.data.number,
        size: response.data.size
      };
    } catch (error) {
      throw new Error(`Failed to fetch my waste: ${error.message}`);
    }
  }

  async setStatus(id, status) {
    try {
      const response = await api.patch(`/api/v1/waste/${id}/status`, { status });
      return WasteMapper.toDomain(response.data);
    } catch (error) {
      throw new Error(`Failed to set waste status: ${error.message}`);
    }
  }

  async requestPhone(id) {
    try {
      const response = await api.post(`/api/v1/waste/${id}/request-phone`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to request phone: ${error.message}`);
    }
  }
}
