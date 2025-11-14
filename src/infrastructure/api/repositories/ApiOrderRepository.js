import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderMapper } from '../mappers/OrderMapper';
import api from '../../../services/api';

/**
 * ApiOrderRepository - Concrete implementation of IOrderRepository
 * Uses HTTP API to persist and retrieve orders
 * Follows Dependency Inversion Principle - implements interface from domain layer
 */
export class ApiOrderRepository extends IOrderRepository {
  /**
   * Search orders with filters
   */
  async search(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/api/v1/orders?${params.toString()}`);
    const data = response.data;

    // Handle both array and paginated response
    const ordersList = Array.isArray(data) ? data : (data?.content || []);
    return OrderMapper.toDomainList(ordersList);
  }

  /**
   * Get order by ID
   */
  async getById(id) {
    const response = await api.get(`/api/v1/orders/${id}`);
    return OrderMapper.toDomain(response.data);
  }

  /**
   * Create new order
   */
  async create(order, categoryId, estateId) {
    const dto = OrderMapper.toCreateDTO(order, categoryId, estateId);
    const response = await api.post('/api/v1/orders', dto);
    return OrderMapper.toDomain(response.data);
  }

  /**
   * Update existing order
   */
  async update(order, categoryId, estateId) {
    const dto = OrderMapper.toUpdateDTO(order, categoryId, estateId);
    const response = await api.put('/api/v1/orders', dto);
    return OrderMapper.toDomain(response.data);
  }

  /**
   * Delete order by ID
   */
  async delete(id) {
    await api.delete(`/api/v1/orders/${id}`);
  }

  /**
   * Get customer's own orders with pagination
   * Uses /api/v1/orders/customer endpoint
   * @param {Object} params - { page, size, sort }
   */
  async getCustomerOrders(params = { page: 0, size: 10, sort: 'createAt,desc' }) {
    // Build query string manually to avoid encoding the comma in sort parameter
    const page = params.page || 0;
    const size = params.size || 10;
    const sort = params.sort || 'createAt,desc';

    const queryString = `page=${page}&size=${size}&sort=${sort}`;

    const response = await api.get(`/api/v1/orders/customer?${queryString}`);
    const data = response.data;

    // Handle paginated response
    const ordersList = Array.isArray(data) ? data : (data?.content || []);
    return OrderMapper.toDomainList(ordersList);
  }

  /**
   * Request builder's phone number
   * POST /api/v1/orders/{orderPublicId}/request-phone
   */
  async requestBuilderPhone(orderId, offerId) {
    const response = await api.post(`/api/v1/orders/${orderId}/request-phone`, {
      offerPublicId: offerId,
    });
    return response.data;
  }

  /**
   * Confirm deal with builder
   * POST /api/v1/orders/{orderPublicId}/confirm-deal
   */
  async confirmDeal(orderId, dealData) {
    const response = await api.post(`/api/v1/orders/${orderId}/confirm-deal`, dealData);
    return response.data;
  }
}
