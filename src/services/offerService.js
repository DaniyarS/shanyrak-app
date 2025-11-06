import api from './api';

const offerService = {
  // Send offer
  sendOffer: async (offerData) => {
    const response = await api.post('/api/v1/offers', offerData);
    return response.data;
  },

  // Search offers by order
  searchByOrder: async (orderId, filters = {}) => {
    const params = new URLSearchParams();
    params.append('orderId', orderId);

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/api/v1/offers?${params.toString()}`);
    return response.data;
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    const response = await api.get(`/api/v1/offers/${offerId}`);
    return response.data;
  },
};

export default offerService;
