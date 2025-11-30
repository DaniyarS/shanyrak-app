export class DeleteWaste {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(id) {
    try {
      await this.wasteRepository.delete(id);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
