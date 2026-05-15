export class FileStorageService {
  /**
   * @param {object} file - should have path, mimetype, originalname
   * @returns {Promise<{url: string, publicId: string|null}>}
   */
  async upload(file) {
    throw new Error("Not implemented");
  }

  /**
   * @param {string} publicId
   */
  async delete(publicId) {
    throw new Error("Not implemented");
  }
}