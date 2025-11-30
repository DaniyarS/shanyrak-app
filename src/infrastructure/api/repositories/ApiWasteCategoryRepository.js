import api from '../../../services/api.js';
import { IWasteCategoryRepository } from '../../../domain/repositories/IWasteCategoryRepository.js';
import { WasteCategoryMapper } from '../mappers/WasteCategoryMapper.js';

export class ApiWasteCategoryRepository extends IWasteCategoryRepository {
  async getAll() {
    try {
      const response = await api.get('/api/v1/waste-categories');
      return WasteCategoryMapper.toDomainArray(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch waste categories: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`/api/v1/waste-categories/${id}`);
      return WasteCategoryMapper.toDomain(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch waste category: ${error.message}`);
    }
  }

  async getChildren(id) {
    try {
      const response = await api.get(`/api/v1/waste-categories/${id}/children`);
      return WasteCategoryMapper.toDomainArray(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch waste category children: ${error.message}`);
    }
  }

  async getTree() {
    try {
      const response = await api.get('/api/v1/waste-categories/tree');
      return WasteCategoryMapper.toDomainArray(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch waste category tree: ${error.message}`);
    }
  }
}
