export class CreateWaste {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(wasteData) {
    try {
      const waste = await this.wasteRepository.create(wasteData);

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
