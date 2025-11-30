export class GetWasteById {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(id) {
    try {
      const waste = await this.wasteRepository.getById(id);

      return {
        success: true,
        waste
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
