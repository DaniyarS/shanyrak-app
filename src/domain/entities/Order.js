/**
 * Order Status Enum
 * OPEN - Order is open and accepting offers
 * IN_PROGRESS - Customer contacted a builder
 * COMPLETED - Work is completed
 * CANCELLED - Order cancelled
 */
export const OrderStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * Order Entity - Domain Model
 * Pure business object representing a service order
 * Independent of frameworks and infrastructure
 */
export class Order {
  constructor({
    id,
    title, // Legacy field, may be null
    description,
    budgetMin, // Legacy field, may be null
    budgetMax, // Legacy field, may be null
    price, // New field (optional)
    unit, // New field (optional)
    priceType, // New field: 'FIXED' or 'NEGOTIABLE'
    category,
    realEstate,
    status,
    createdAt,
    updatedAt,
    offersCount,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    // Legacy fields
    this.budgetMin = budgetMin;
    this.budgetMax = budgetMax;
    // New fields
    this.price = price;
    this.unit = unit;
    this.priceType = priceType || 'NEGOTIABLE';
    this.category = category; // Category entity
    this.realEstate = realEstate; // Estate entity
    this.status = status || OrderStatus.OPEN;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.offersCount = offersCount || 0;

    Object.freeze(this); // Immutable entity
  }

  /**
   * Get budget range as formatted string (legacy)
   */
  getBudgetRange() {
    if (this.budgetMax && this.budgetMax > 0) {
      return `${this.budgetMin}-${this.budgetMax} ₸`;
    }
    return `${this.budgetMin}+ ₸`;
  }

  /**
   * Check if order has a maximum budget set (legacy)
   */
  hasMaxBudget() {
    return this.budgetMax && this.budgetMax > 0;
  }

  /**
   * Get price display string
   */
  getPriceDisplay() {
    if (this.priceType === 'FIXED' && this.price) {
      return `${this.price} ₸`;
    }
    return 'Negotiable';
  }

  /**
   * Validate order data
   */
  static validate(data) {
    const errors = {};

    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    }

    if (!data.priceType) {
      errors.priceType = 'Price type is required';
    }

    // If priceType is FIXED, price and unit are required
    if (data.priceType === 'FIXED') {
      if (!data.price || data.price <= 0) {
        errors.price = 'Price must be greater than 0 when price type is FIXED';
      }
      if (!data.unit || data.unit.trim().length === 0) {
        errors.unit = 'Unit is required when price type is FIXED';
      }
    }

    if (!data.category) {
      errors.category = 'Category is required';
    }

    if (!data.realEstate) {
      errors.realEstate = 'Property is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
