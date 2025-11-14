import api from './api';

const contractService = {
  // Confirm offer and create contract
  confirmOffer: async (contractData) => {
    const response = await api.post('/api/v1/contracts', contractData);
    return response.data;
  },

  // Get contracts by order
  getContractsByOrder: async (orderId) => {
    const response = await api.get(`/api/v1/contracts/by-order?orderId=${orderId}`);
    return response.data;
  },

  // Get contract by ID
  getContractById: async (contractId) => {
    const response = await api.get(`/api/v1/contracts/${contractId}`);
    return response.data;
  },
};

export default contractService;
