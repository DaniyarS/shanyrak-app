export class GetMyWaste {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(page = 0, size = 20) {
    try {
      const result = await this.wasteRepository.getMyWaste(page, size);

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
