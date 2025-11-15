import api from './api';

const builderService = {
  /**
   * Add a category to builder
   * @param {string} builderId - The builder's ID
   * @param {object} categoryData - { category: { publicId: string }, price: string, description: string }
   * @returns {Promise} - Response with category data
   */
  addCategory: async (builderId, categoryData) => {
    const response = await api.post(
      `/api/v1/builders/${builderId}/category`,
      categoryData
    );
    return response.data;
  },

  /**
   * Delete a builder category
   * @param {string} categoryId - The category ID to delete
   * @returns {Promise} - Response
   */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/api/v1/builders/category/${categoryId}`);
    return response.data;
  },

  /**
   * Update a builder category
   * @param {string} categoryId - The category ID to update
   * @param {object} categoryData - { price: string, description: string }
   * @returns {Promise} - Response with updated category data
   */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(
      `/api/v1/builders/category/${categoryId}`,
      categoryData
    );
    return response.data;
  },

  /**
   * Search builders
   * @param {object} filters - { city, district, ratingFrom, categoryPublicId, page, size }
   * @returns {Promise} - Response with builders list
   */
  searchBuilders: async (filters = {}) => {
    const response = await api.get('/api/v1/builders/search', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get current builder profile
   * @returns {Promise} - Response with builder data
   */
  getMe: async () => {
    const response = await api.get('/api/v1/builders/me');
    return response.data;
  },

  /**
   * Get builder by ID
   * @param {string} builderId - The builder's public ID
   * @returns {Promise} - Response with builder data
   */
  getBuilder: async (builderId) => {
    const response = await api.get(`/api/v1/builders/${builderId}`);
    return response.data;
  },

  /**
   * Update builder profile
   * @param {string} builderId - The builder's ID
   * @param {object} builderData - Builder data to update
   * @returns {Promise} - Response with updated builder data
   */
  updateBuilder: async (builderId, builderData) => {
    const response = await api.put(`/api/v1/builders/${builderId}`, builderData);
    return response.data;
  },
};

export default builderService;
