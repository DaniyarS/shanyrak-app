/**
 * GetOrderPhotos Use Case
 * Business logic for fetching order photos
 */
export class GetOrderPhotos {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  /**
   * Execute the get order photos use case
   * @param {string} orderPublicId - The order's public ID
   * @returns {Promise<Object>} Result with photos array
   */
  async execute(orderPublicId) {
    try {
      if (!orderPublicId) {
        return {
          success: false,
          photos: [],
          errors: { orderPublicId: 'Order ID is required' },
        };
      }

      const result = await this.fileRepository.getFiles('ORDER_PHOTO', orderPublicId);

      if (result.success) {
        return {
          success: true,
          photos: result.files || [],
        };
      }

      return {
        success: false,
        photos: [],
        errors: result.errors || { fetch: 'Failed to fetch order photos' },
      };
    } catch (error) {
      console.error('GetOrderPhotos use case failed:', error);
      return {
        success: false,
        photos: [],
        errors: { fetch: error.message || 'Failed to fetch order photos' },
      };
    }
  }
}
