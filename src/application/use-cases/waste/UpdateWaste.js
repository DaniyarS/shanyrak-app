export class UpdateWaste {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(id, wasteData) {
    try {
      const waste = await this.wasteRepository.update(id, wasteData);

      return {
        success: true,
        waste
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errors: { general: error.message }
      };
    }
  }
}
