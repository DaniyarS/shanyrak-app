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

  /**
   * Update existing offer (builder can edit if status is PENDING)
   * PUT /api/v1/offers/{publicId}
   */
  async update(offerId, offer) {
    const dto = OfferMapper.toUpdateDTO(offer);
    const response = await api.put(`/api/v1/offers/${offerId}`, dto);
    return OfferMapper.toDomain(response.data);
  }

  /**
   * Withdraw offer (sets status to WITHDRAWN)
   * DELETE /api/v1/offers/{publicId}
   */
  async withdraw(offerId) {
    await api.delete(`/api/v1/offers/${offerId}`);
  }

  /**
   * Get builder information by offer ID
   * GET /api/v1/offers/{publicId}/builder
   */
  async getBuilderByOfferId(offerId) {
    const response = await api.get(`/api/v1/offers/${offerId}/builder`);
    return response.data;
  }

  /**
   * Accept offer (customer accepts the offer)
   * POST /api/v1/offers/{publicId}/accept
   */
  async accept(offerId, data) {
    const response = await api.post(`/api/v1/offers/${offerId}/accept`, data);
    return response.data;
  }

  /**
   * Reject offer (customer rejects the offer)
   * POST /api/v1/offers/{publicId}/reject
   */
  async reject(offerId) {
    const response = await api.post(`/api/v1/offers/${offerId}/reject`);
    return response.data;
  }
}
