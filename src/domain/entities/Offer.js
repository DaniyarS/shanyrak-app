/**
 * Offer Status Enum
 * PENDING - Offer sent, awaiting review
 * ACCEPTED - Accepted by customer
 * REJECTED - Rejected by customer or system
 * WITHDRAWN - Builder withdrew the offer
 */
export const OfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

/**
 * Offer Entity - Domain Model
 * Represents a service provider's offer on an order
 */
export class Offer {
  constructor({
    id,
    orderId,
    price,
    unit,
    daysEstimate,
    message,
    status,
    createdAt,
    updatedAt,
    builder,
  }) {
    this.id = id;
    this.orderId = orderId;
    this.price = price;
    this.unit = unit;
    this.daysEstimate = daysEstimate;
    this.message = message;
    this.status = status || OfferStatus.PENDING;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.builder = builder; // Builder object with phone, fullName, ratingAvg, etc.

    Object.freeze(this);
  }

  /**
   * Get formatted price with unit
   */
  getFormattedPrice() {
    const unitLabels = {
      m2: 'per m²',
      unit: 'per unit',
      hour: 'per hour',
      day: 'per day',
      fixed: 'fixed price',
    };

    const unitLabel = unitLabels[this.unit] || this.unit;
    return `${this.price} ₸ ${unitLabel}`;
  }

  /**
   * Get estimated completion time
   */
  getEstimatedDuration() {
    return `${this.daysEstimate} day${this.daysEstimate !== 1 ? 's' : ''}`;
  }

  /**
   * Validate offer data
   */
  static validate(data) {
    const errors = {};

    if (!data.price || data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!data.unit) {
      errors.unit = 'Price unit is required';
    }

    if (!data.daysEstimate || data.daysEstimate <= 0) {
      errors.daysEstimate = 'Days estimate must be greater than 0';
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.message = 'Message is required';
    }

    if (!data.orderId) {
      errors.orderId = 'Order ID is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
