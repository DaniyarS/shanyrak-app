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
    title,
    description,
    budgetMin,
    budgetMax,
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
    this.budgetMin = budgetMin;
    this.budgetMax = budgetMax;
    this.category = category; // Category entity
    this.realEstate = realEstate; // Estate entity
    this.status = status || OrderStatus.OPEN;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.offersCount = offersCount || 0;

    Object.freeze(this); // Immutable entity
  }

  /**
   * Get budget range as formatted string
   */
  getBudgetRange() {
    if (this.budgetMax && this.budgetMax > 0) {
      return `${this.budgetMin}-${this.budgetMax} ₸`;
    }
    return `${this.budgetMin}+ ₸`;
  }

  /**
   * Check if order has a maximum budget set
   */
  hasMaxBudget() {
    return this.budgetMax && this.budgetMax > 0;
  }

  /**
   * Validate order data
   */
  static validate(data) {
    const errors = {};

    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Title is required';
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    }

    if (!data.budgetMin || data.budgetMin <= 0) {
      errors.budgetMin = 'Minimum budget must be greater than 0';
    }

    if (data.budgetMax && data.budgetMax < data.budgetMin) {
      errors.budgetMax = 'Maximum budget must be greater than minimum budget';
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
