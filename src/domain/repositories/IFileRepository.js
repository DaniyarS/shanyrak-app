/**
 * File Repository Interface
 * Defines contract for file storage operations
 */
export class IFileRepository {
  /**
   * Upload a file
   * @param {File} file - The file to upload
   * @param {string} scope - The scope (avatars, orders, portfolio)
   * @param {string} linkType - The link type (USER_AVATAR, ORDER_PHOTO, BUILDER_PORTFOLIO)
   * @param {string} linkPublicId - Optional public ID to link the file to
   * @param {number} sortOrder - Optional sort order
   * @returns {Promise<{success: boolean, file?: File, errors?: object}>}
   */
  async upload(file, scope, linkType, linkPublicId = null, sortOrder = 0) {
    throw new Error('Method not implemented');
  }

  /**
   * Get files by link type and optional link public ID
   * @param {string} linkType - The link type
   * @param {string} linkPublicId - Optional public ID
   * @returns {Promise<{success: boolean, files?: Array<File>, errors?: object}>}
   */
  async getFiles(linkType, linkPublicId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a file by ID
   * @param {string} fileId - The file ID
   * @returns {Promise<{success: boolean, errors?: object}>}
   */
  async delete(fileId) {
    throw new Error('Method not implemented');
  }
}
