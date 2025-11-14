/**
 * User Entity - Domain Model
 * Represents an authenticated user
 */
export class User {
  constructor({
    phone,
    fullName,
    role,
  }) {
    this.phone = phone;
    this.fullName = fullName;
    this.role = role;

    Object.freeze(this);
  }

  /**
   * Check if user is a customer
   */
  isCustomer() {
    return this.role === 'CUSTOMER';
  }

  /**
   * Check if user is a builder (service provider)
   */
  isBuilder() {
    return this.role === 'BUILDER';
  }

  /**
   * Check if user can manage properties
   */
  canManageProperties() {
    return this.isCustomer();
  }

  /**
   * Check if user can create orders
   */
  canCreateOrders() {
    return this.isCustomer();
  }

  /**
   * Check if user can make offers
   */
  canMakeOffers() {
    return this.isBuilder();
  }

  /**
   * Validate user data
   */
  static validate(data) {
    const errors = {};

    if (!data.phone || !/^\d{11}$/.test(data.phone)) {
      errors.phone = 'Phone number must be 11 digits';
    }

    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!data.role || !['CUSTOMER', 'BUILDER'].includes(data.role)) {
      errors.role = 'Role must be either CUSTOMER or BUILDER';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
