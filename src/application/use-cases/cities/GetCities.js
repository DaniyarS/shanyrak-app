/**
 * GetCities use case
 * Fetches the list of cities
 */
export class GetCities {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  /**
   * Get cities list
   * @param {boolean} majorOnly - If true, returns only major cities
   * @returns {Promise<{success: boolean, cities?: Array, errors?: object}>}
   */
  async execute(majorOnly = false) {
    try {
      const cities = majorOnly
        ? await this.cityRepository.getMajorCities()
        : await this.cityRepository.getAll();

      // Sort by sortOrder and then by name
      const sortedCities = cities.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        success: true,
        cities: sortedCities,
      };
    } catch (error) {
      console.error('Error fetching cities:', error);

      return {
        success: false,
        errors: {
          message: error.response?.data?.message || 'Failed to fetch cities',
        },
      };
    }
  }
}
