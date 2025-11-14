import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/v1/orders', orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (orderData) => {
    const response = await api.put('/api/v1/orders', orderData);
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  // Search orders with filters
  searchOrders: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/api/v1/orders?${params.toString()}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data;
  },
};

export default orderService;
