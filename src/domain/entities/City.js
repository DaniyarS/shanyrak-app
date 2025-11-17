/**
 * City Entity - Domain Model
 * Represents a city in the system
 */
export class City {
  constructor({
    id,
    name,
    nameKz,
    code,
    region,
    regionKz,
    isMajor,
    sortOrder,
  }) {
    this.id = id;
    this.name = name;
    this.nameKz = nameKz;
    this.code = code;
    this.region = region;
    this.regionKz = regionKz;
    this.isMajor = isMajor;
    this.sortOrder = sortOrder;

    Object.freeze(this);
  }

  /**
   * Get localized city name
   * @param {string} language - Language code ('kk', 'ru', 'en')
   * @returns {string}
   */
  getLocalizedName(language = 'ru') {
    if (language === 'kk' && this.nameKz) {
      return this.nameKz;
    }
    return this.name;
  }

  /**
   * Get localized region name
   * @param {string} language - Language code ('kk', 'ru', 'en')
   * @returns {string}
   */
  getLocalizedRegion(language = 'ru') {
    if (language === 'kk' && this.regionKz) {
      return this.regionKz;
    }
    return this.region;
  }

  /**
   * Get full localized name with region
   * @param {string} language - Language code ('kk', 'ru', 'en')
   * @returns {string}
   */
  getFullName(language = 'ru') {
    const cityName = this.getLocalizedName(language);
    const region = this.getLocalizedRegion(language);

    if (region) {
      return `${cityName}, ${region}`;
    }

    return cityName;
  }
}
