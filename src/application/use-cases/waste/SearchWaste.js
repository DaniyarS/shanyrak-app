export class SearchWaste {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(filters = {}) {
    try {
      const result = await this.wasteRepository.search(filters);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        content: [],
        totalElements: 0,
        totalPages: 0
      };
    }
  }
}
