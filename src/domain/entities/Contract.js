/**
 * Contract Status Enum
 * ACTIVE - Work in progress
 * COMPLETED - Completed by both parties
 * CANCELLED - Cancelled
 * PENDING_COMPLETION - Awaiting confirmation from both parties
 */
export const ContractStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PENDING_COMPLETION: 'PENDING_COMPLETION',
};

/**
 * Contract Entity - Domain Model
 * Represents an agreement between customer and builder
 */
export class Contract {
  constructor({
    id,
    orderId,
    offerId,
    status,
    startDate,
    endDate,
    customerConfirmedComplete,
    builderConfirmedComplete,
    completionRequestedAt,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.orderId = orderId;
    this.offerId = offerId;
    this.status = status || ContractStatus.ACTIVE;
    this.startDate = startDate;
    this.endDate = endDate;
    this.customerConfirmedComplete = customerConfirmedComplete || false;
    this.builderConfirmedComplete = builderConfirmedComplete || false;
    this.completionRequestedAt = completionRequestedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    Object.freeze(this);
  }

  /**
   * Check if contract is pending completion from other party
   */
  isPendingCompletion() {
    return this.status === ContractStatus.PENDING_COMPLETION;
  }

  /**
   * Check if contract is active
   */
  isActive() {
    return this.status === ContractStatus.ACTIVE;
  }

  /**
   * Check if contract is completed
   */
  isCompleted() {
    return this.status === ContractStatus.COMPLETED;
  }

  /**
   * Check if both parties confirmed completion
   */
  isBothPartiesConfirmed() {
    return this.customerConfirmedComplete && this.builderConfirmedComplete;
  }

  /**
   * Validate contract data
   */
  static validate(data) {
    const errors = {};

    if (!data.orderId) {
      errors.orderId = 'Order ID is required';
    }

    if (!data.offerId) {
      errors.offerId = 'Offer ID is required';
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required';
    }

    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      errors.endDate = 'End date must be after start date';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
