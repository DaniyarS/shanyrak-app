import api from './api';

const estateService = {
  // Create new estate
  createEstate: async (estateData) => {
    const response = await api.post('/api/v1/estates', estateData);
    return response.data;
  },

  // Update estate
  updateEstate: async (estateData) => {
    const response = await api.put('/api/v1/estates', estateData);
    return response.data;
  },

  // Get customer estates
  getCustomerEstates: async () => {
    const response = await api.get('/api/v1/estates');
    return response.data;
  },

  // Delete estate
  deleteEstate: async (estateId) => {
    const response = await api.delete(`/api/v1/estates/${estateId}`);
    return response.data;
  },
};

export default estateService;
