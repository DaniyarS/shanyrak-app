import api from './api';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/api/v1/categories');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/api/v1/categories/${categoryId}`);
    return response.data;
  },

  // Get category children
  getCategoryChildren: async (categoryId) => {
    const response = await api.get(`/api/v1/categories/${categoryId}/children`);
    return response.data;
  },
};

export default categoryService;
