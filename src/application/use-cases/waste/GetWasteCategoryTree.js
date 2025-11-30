export class GetWasteCategoryTree {
  constructor(wasteCategoryRepository) {
    this.wasteCategoryRepository = wasteCategoryRepository;
  }

  async execute() {
    try {
      const tree = await this.wasteCategoryRepository.getTree();

      return {
        success: true,
        tree
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tree: []
      };
    }
  }
}
