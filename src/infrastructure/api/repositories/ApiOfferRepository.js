import { IOfferRepository } from '../../../domain/repositories/IOfferRepository';
import { OfferMapper } from '../mappers/OfferMapper';
import api from '../../../services/api';

/**
 * ApiOfferRepository - Concrete implementation of IOfferRepository
 */
export class ApiOfferRepository extends IOfferRepository {
  /**
   * Create new offer
   */
  async create(offer, orderId) {
    const dto = OfferMapper.toCreateDTO(offer, orderId);
    const response = await api.post('/api/v1/offers', dto);
    return OfferMapper.toDomain(response.data);
  }

  /**
   * Get offers by order ID
   */
  async getByOrderId(orderId, filters = {}) {
    const params = new URLSearchParams({ orderId });

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/api/v1/offers?${params.toString()}`);
    const data = response.data;

    const offersList = Array.isArray(data) ? data : (data?.content || []);
    return OfferMapper.toDomainList(offersList);
  }

  /**
   * Get offer by ID
   */
  async getById(id) {
    const response = await api.get(`/api/v1/offers/${id}`);
    return OfferMapper.toDomain(response.data);
  }
}
