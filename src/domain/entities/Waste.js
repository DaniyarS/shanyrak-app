export class Waste {
  constructor({
    id,
    title,
    description,
    category,
    city,
    district,
    unit,
    amount,
    price,
    status = 'ACTIVE',
    photos = [],
    createdAt,
    updatedAt,
    owner = null
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.city = city;
    this.district = district;
    this.unit = unit;
    this.amount = amount;
    this.price = price;
    this.status = status;
    this.photos = photos;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.owner = owner;

    Object.freeze(this);
  }

  isFree() {
    return this.price === 0;
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  isSold() {
    return this.status === 'SOLD';
  }

  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Title is required';
    }

    if (!this.category || !this.category.id) {
      errors.category = 'Category is required';
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.city = 'City is required';
    }

    if (!this.unit || this.unit.trim().length === 0) {
      errors.unit = 'Unit is required';
    }

    if (this.amount === null || this.amount === undefined || this.amount < 0) {
      errors.amount = 'Valid amount is required';
    }

    if (this.price === null || this.price === undefined || this.price < 0) {
      errors.price = 'Valid price is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
