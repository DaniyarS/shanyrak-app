export class IWasteRepository {
  async create(waste) {
    throw new Error('create method not implemented');
  }

  async update(id, waste) {
    throw new Error('update method not implemented');
  }

  async delete(id) {
    throw new Error('delete method not implemented');
  }

  async getById(id) {
    throw new Error('getById method not implemented');
  }

  async search(filters) {
    throw new Error('search method not implemented');
  }

  async getMyWaste(page = 0, size = 20) {
    throw new Error('getMyWaste method not implemented');
  }

  async setStatus(id, status) {
    throw new Error('setStatus method not implemented');
  }

  async requestPhone(id) {
    throw new Error('requestPhone method not implemented');
  }
}
