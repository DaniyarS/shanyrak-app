/**
 * Category Entity - Domain Model
 * Represents a service category
 */
export class Category {
  constructor({
    id,
    name,
    description,
    parentId,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    Object.freeze(this);
  }

  /**
   * Check if this is a root category
   */
  isRootCategory() {
    return !this.parentId;
  }

  /**
   * Validate category data
   */
  static validate(data) {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Category name is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
