/**
 * Builder Entity - Domain Model
 * Represents a service provider/builder in the system
 */
export class Builder {
  constructor({
    id,
    fullName,
    email,
    phone,
    avatarLink,
    role,
    login,
    ratingAvg,
    aboutMe,
    experienceYears,
    city,
    district,
    jobsDone,
    available,
    priceList,
    verified,
    recommended,
  }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.avatarLink = avatarLink;
    this.role = role;
    this.login = login;
    this.ratingAvg = ratingAvg || 0;
    this.aboutMe = aboutMe;
    this.experienceYears = experienceYears || 0;
    this.city = city;
    this.district = district;
    this.jobsDone = jobsDone || 0;
    this.available = available !== undefined ? available : true;
    this.priceList = priceList;
    this.verified = verified || false;
    this.recommended = recommended || false;

    Object.freeze(this);
  }

  /**
   * Get formatted rating
   */
  getFormattedRating() {
    return this.ratingAvg.toFixed(1);
  }

  /**
   * Check if builder is available
   */
  isAvailable() {
    return this.available === true;
  }

  /**
   * Check if builder is verified
   */
  isVerified() {
    return this.verified === true;
  }

  /**
   * Check if builder is recommended
   */
  isRecommended() {
    return this.recommended === true;
  }

  /**
   * Get display name (fallback to login if fullName is missing)
   */
  getDisplayName() {
    return this.fullName || this.login || 'Unknown Builder';
  }

  /**
   * Validate builder data
   */
  static validate(data) {
    const errors = [];

    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    if (!data.phone || !/^\d{11}$/.test(data.phone)) {
      errors.push('Phone number must be 11 digits');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email is invalid');
    }

    if (data.experienceYears && (data.experienceYears < 0 || data.experienceYears > 100)) {
      errors.push('Experience years must be between 0 and 100');
    }

    if (data.ratingAvg && (data.ratingAvg < 0 || data.ratingAvg > 5)) {
      errors.push('Rating must be between 0 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
