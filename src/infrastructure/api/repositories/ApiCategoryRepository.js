import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryMapper } from '../mappers/CategoryMapper';
import api from '../../../services/api';

/**
 * ApiCategoryRepository - Concrete implementation of ICategoryRepository
 */
export class ApiCategoryRepository extends ICategoryRepository {
  /**
   * Get all categories
   */
  async getAll() {
    const response = await api.get('/api/v1/categories');
    const data = response.data;

    const categoriesList = Array.isArray(data) ? data : (data?.content || []);
    return CategoryMapper.toDomainList(categoriesList);
  }

  /**
   * Get category by ID
   */
  async getById(id) {
    const response = await api.get(`/api/v1/categories/${id}`);
    return CategoryMapper.toDomain(response.data);
  }

  /**
   * Get children categories
   */
  async getChildren(id) {
    const response = await api.get(`/api/v1/categories/${id}/children`);
    const data = response.data;

    const categoriesList = Array.isArray(data) ? data : (data?.content || []);
    return CategoryMapper.toDomainList(categoriesList);
  }
}
