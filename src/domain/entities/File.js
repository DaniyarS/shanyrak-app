/**
 * File Entity - Domain Model
 * Represents an uploaded file
 */
export class File {
  constructor({
    id,
    publicId,
    url,
    linkType,
    linkPublicId,
    scope,
    sortOrder,
    createdAt,
  }) {
    this.id = id || publicId;
    this.publicId = publicId;
    this.url = url;
    this.linkType = linkType;
    this.linkPublicId = linkPublicId;
    this.scope = scope;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;

    Object.freeze(this);
  }

  /**
   * Check if this file is a user avatar
   */
  isAvatar() {
    return this.linkType === 'USER_AVATAR';
  }

  /**
   * Check if this file is an order photo
   */
  isOrderPhoto() {
    return this.linkType === 'ORDER_PHOTO';
  }

  /**
   * Check if this file is a builder portfolio photo
   */
  isPortfolioPhoto() {
    return this.linkType === 'BUILDER_PORTFOLIO';
  }
}
