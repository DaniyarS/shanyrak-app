/**
 * Estate (Real Estate) Entity - Domain Model
 * Pure business object representing a property
 */
export class Estate {
  constructor({
    id,
    kind,
    addressLine,
    city,
    district,
    latitude,
    longitude,
    areaM2,
    floor,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.kind = kind;
    this.addressLine = addressLine;
    this.city = city;
    this.district = district;
    this.latitude = latitude;
    this.longitude = longitude;
    this.areaM2 = areaM2;
    this.floor = floor;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    Object.freeze(this);
  }

  /**
   * Get full address as string
   */
  getFullAddress() {
    return `${this.addressLine}, ${this.district}, ${this.city}`;
  }

  /**
   * Get property description
   */
  getDescription() {
    return `${this.kind} - ${this.areaM2} m²${this.floor ? `, Floor ${this.floor}` : ''}`;
  }

  /**
   * Validate estate data
   */
  static validate(data) {
    const errors = {};

    if (!data.kind || data.kind.trim().length === 0) {
      errors.kind = 'Property type is required';
    }

    if (!data.addressLine || data.addressLine.trim().length === 0) {
      errors.addressLine = 'Address is required';
    }

    if (!data.city || data.city.trim().length === 0) {
      errors.city = 'City is required';
    }

    if (!data.district || data.district.trim().length === 0) {
      errors.district = 'District is required';
    }

    if (!data.areaM2 || data.areaM2 <= 0) {
      errors.areaM2 = 'Area must be greater than 0';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
