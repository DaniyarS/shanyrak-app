import api from './api';

const fileService = {
  /**
   * Upload avatar photo
   * @param {File} file - The image file to upload
   * @returns {Promise} - Response with file data
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', 'avatars');
    formData.append('linkType', 'USER_AVATAR');

    const response = await api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Upload builder portfolio photo
   * @param {File} file - The image file to upload
   * @param {number} sortOrder - Sort order for the photo
   * @returns {Promise} - Response with file data
   */
  uploadBuilderPortfolio: async (file, sortOrder = 0) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', 'portfolio');
    formData.append('linkType', 'BUILDER_PORTFOLIO');
    formData.append('sortOrder', sortOrder.toString());

    const response = await api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Upload order photo
   * @param {File} file - The image file to upload
   * @param {string} orderPublicId - The order's public ID
   * @param {number} sortOrder - Sort order for the photo
   * @returns {Promise} - Response with file data
   */
  uploadOrderPhoto: async (file, orderPublicId, sortOrder = 0) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', 'orders');
    formData.append('linkType', 'ORDER_PHOTO');
    formData.append('linkPublicId', orderPublicId);
    formData.append('sortOrder', sortOrder.toString());

    const response = await api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get builder's portfolio photos
   * @param {string} builderPublicId - The builder's public ID
   * @returns {Promise} - Response with photos array
   */
  getBuilderPortfolio: async (builderPublicId) => {
    const response = await api.get('/api/v1/files', {
      params: {
        linkType: 'BUILDER_PORTFOLIO',
        linkPublicId: builderPublicId,
      },
    });

    return response.data;
  },

  /**
   * Get avatar photo
   * @param {string} userPublicId - Optional user public ID (for getting other user's avatar)
   * @returns {Promise} - Response with avatar data
   */
  getAvatar: async (userPublicId = null) => {
    const params = {
      linkType: 'USER_AVATAR',
    };

    if (userPublicId) {
      params.linkPublicId = userPublicId;
    }

    const response = await api.get('/api/v1/files', { params });
    return response.data;
  },

  /**
   * Delete a file
   * @param {string} fileId - The file's ID
   * @returns {Promise} - Response
   */
  deleteFile: async (fileId) => {
    const response = await api.delete(`/api/v1/files/${fileId}`);
    return response.data;
  },
};

export default fileService;
