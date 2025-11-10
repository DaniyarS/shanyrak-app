import { Estate } from '../../../domain/entities/Estate';

/**
 * ManageEstates Use Case
 * Handles all estate operations (CRUD)
 */
export class ManageEstates {
  constructor(estateRepository) {
    this.estateRepository = estateRepository;
  }

  /**
   * Get all customer estates
   */
  async getAll() {
    try {
      const estates = await this.estateRepository.getCustomerEstates();

      return {
        success: true,
        estates,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get estates',
        estates: [],
      };
    }
  }

  /**
   * Create new estate
   */
  async create(estateData) {
    const validation = Estate.validate(estateData);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const estate = new Estate({ id: null, ...estateData });
      const createdEstate = await this.estateRepository.create(estate);

      return {
        success: true,
        estate: createdEstate,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to create estate' },
      };
    }
  }

  /**
   * Update existing estate
   */
  async update(estateId, estateData) {
    const validation = Estate.validate(estateData);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const estate = new Estate({ id: estateId, ...estateData });
      const updatedEstate = await this.estateRepository.update(estate);

      return {
        success: true,
        estate: updatedEstate,
      };
    } catch (error) {
      return {
        success: false,
        errors: { submit: error.response?.data?.message || 'Failed to update estate' },
      };
    }
  }

  /**
   * Delete estate
   */
  async delete(estateId) {
    if (!estateId) {
      return {
        success: false,
        error: 'Estate ID is required',
      };
    }

    try {
      await this.estateRepository.delete(estateId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete estate',
      };
    }
  }
}
