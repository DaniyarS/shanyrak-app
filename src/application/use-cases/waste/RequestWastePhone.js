export class RequestWastePhone {
  constructor(wasteRepository) {
    this.wasteRepository = wasteRepository;
  }

  async execute(id) {
    try {
      const result = await this.wasteRepository.requestPhone(id);

      return {
        success: true,
        phone: result.phone
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
