import { ICityRepository } from '../../../domain/repositories/ICityRepository';
import { CityMapper } from '../mappers/CityMapper';
import api from '../../../services/api';

/**
 * ApiCityRepository - Concrete implementation of ICityRepository
 */
export class ApiCityRepository extends ICityRepository {
  /**
   * Get all cities
   */
  async getAll() {
    const response = await api.get('/api/v1/cities');
    const data = response.data;

    const citiesList = Array.isArray(data) ? data : (data?.content || []);
    return CityMapper.toDomainList(citiesList);
  }

  /**
   * Get major cities
   */
  async getMajorCities() {
    const response = await api.get('/api/v1/cities/major');
    const data = response.data;

    const citiesList = Array.isArray(data) ? data : (data?.content || []);
    return CityMapper.toDomainList(citiesList);
  }

  /**
   * Get city by ID
   */
  async getById(id) {
    const response = await api.get(`/api/v1/cities/${id}`);
    return CityMapper.toDomain(response.data);
  }
}
