/**
 * Review Entity - Domain Model
 * Represents a review from customer or builder after contract completion
 */
export class Review {
  constructor({
    id,
    contractId,
    rating,
    message,
    reviewerRole,
    reviewerName,
    createdAt,
  }) {
    this.id = id;
    this.contractId = contractId;
    this.rating = rating;
    this.message = message;
    this.reviewerRole = reviewerRole; // CUSTOMER or SERVICE_PROVIDER
    this.reviewerName = reviewerName;
    this.createdAt = createdAt;

    Object.freeze(this);
  }

  /**
   * Check if review is from customer
   */
  isFromCustomer() {
    return this.reviewerRole === 'CUSTOMER';
  }

  /**
   * Check if review is from builder
   */
  isFromBuilder() {
    return this.reviewerRole === 'SERVICE_PROVIDER';
  }

  /**
   * Get star rating display
   */
  getStarDisplay() {
    return '⭐'.repeat(this.rating);
  }

  /**
   * Validate review data
   */
  static validate(data) {
    const errors = {};

    if (!data.contractId) {
      errors.contractId = 'Contract ID is required';
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.message = 'Review message is required';
    }

    if (data.message && data.message.trim().length < 10) {
      errors.message = 'Review message must be at least 10 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
